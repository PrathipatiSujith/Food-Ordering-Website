import { useState } from "react";

export default function OrderHistory({
  orders,
  user,
  onBack,
  onReorder,
  onCancelOrder,
  onLogin,
  onAddDemoOrder,
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Determine current live status of an order
  function getOrderStatus(order) {
    if (order.status === "Cancelled") {
      return { label: "Cancelled", step: 0, statusClass: "status-cancelled", icon: "✕" };
    }
    const timestamp = order.timestamp || (order.createdAt ? new Date(order.createdAt).getTime() : Date.now());
    const minutesAgo = Math.floor((Date.now() - timestamp) / (1000 * 60));

    if (minutesAgo < 2) {
      return { label: "Order Confirmed", step: 1, statusClass: "status-confirmed", icon: "✓" };
    } else if (minutesAgo < 10) {
      return { label: "Preparing Food", step: 2, statusClass: "status-preparing", icon: "👨‍🍳" };
    } else if (minutesAgo < 25) {
      return { label: "Out for Delivery", step: 3, statusClass: "status-delivery", icon: "🛵" };
    } else {
      return { label: "Delivered", step: 4, statusClass: "status-delivered", icon: "📦" };
    }
  }

  // Filter orders by user (if logged in, show orders matching user email or demo guest orders)
  const userOrders = user
    ? orders.filter((o) => !o.userEmail || o.userEmail === user.email || o.userEmail === "guest")
    : orders;

  const filteredOrders = userOrders.filter((order) => {
    const statusObj = getOrderStatus(order);
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && statusObj.step >= 1 && statusObj.step < 4) ||
      (filter === "delivered" && statusObj.step === 4) ||
      (filter === "cancelled" && statusObj.step === 0);

    const matchesSearch =
      search.trim() === "" ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.items?.some((item) => item.name.toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const activeCount = userOrders.filter((o) => {
    const s = getOrderStatus(o);
    return s.step >= 1 && s.step < 4;
  }).length;
  const deliveredCount = userOrders.filter((o) => getOrderStatus(o).step === 4).length;
  const cancelledCount = userOrders.filter((o) => getOrderStatus(o).step === 0).length;

  return (
    <main className="orders-page">
      <div className="orders-container">
        {/* Top bar */}
        <header className="orders-top-bar">
          <button className="text-button back-link" onClick={onBack}>
            ← Back to menu
          </button>
          <div className="brand" onClick={onBack} style={{ cursor: "pointer" }}>
            🍴 Foodie
          </div>
        </header>

        {/* Page Title & Intro */}
        <div className="orders-header">
          <div>
            <h1>Order History & Tracking</h1>
            <p className="muted">
              {user
                ? `Logged in as ${user.name} (${user.email})`
                : "View demo orders or log in to see your personal history."}
            </p>
          </div>
          {onAddDemoOrder && userOrders.length === 0 && (
            <button className="outline-button sample-order-btn" onClick={onAddDemoOrder}>
              + Add Sample Order
            </button>
          )}
        </div>

        {/* Not Logged In Notice */}
        {!user && (
          <div className="guest-login-banner">
            <div className="banner-content">
              <strong>Want to keep track of your meals?</strong>
              <p>Sign in to save your order history across devices and reorder your favorites in one click.</p>
            </div>
            <button className="primary-button" onClick={onLogin}>
              Login / Sign Up
            </button>
          </div>
        )}

        {/* Filters and Search Bar */}
        {userOrders.length > 0 && (
          <div className="orders-controls">
            <div className="orders-filter-tabs">
              <button
                className={`filter-tab ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Orders ({userOrders.length})
              </button>
              <button
                className={`filter-tab ${filter === "active" ? "active" : ""}`}
                onClick={() => setFilter("active")}
              >
                Active ({activeCount})
              </button>
              <button
                className={`filter-tab ${filter === "delivered" ? "active" : ""}`}
                onClick={() => setFilter("delivered")}
              >
                Delivered ({deliveredCount})
              </button>
              {cancelledCount > 0 && (
                <button
                  className={`filter-tab ${filter === "cancelled" ? "active" : ""}`}
                  onClick={() => setFilter("cancelled")}
                >
                  Cancelled ({cancelledCount})
                </button>
              )}
            </div>

            <input
              type="search"
              className="search-input orders-search"
              placeholder="🔍 Search by dish or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Empty States */}
        {userOrders.length === 0 ? (
          <section className="orders-empty-state">
            <div className="empty-icon">🍽️</div>
            <h2>No orders placed yet</h2>
            <p className="muted">
              Your previous orders and live delivery tracking will show up right here. Treat yourself to something delicious today!
            </p>
            <div className="empty-actions">
              <button className="primary-button" onClick={onBack}>
                Explore Menu
              </button>
              {onAddDemoOrder && (
                <button className="outline-button" onClick={onAddDemoOrder}>
                  Add Demo Order to Test
                </button>
              )}
            </div>
          </section>
        ) : filteredOrders.length === 0 ? (
          <section className="orders-empty-state small-empty">
            <div className="empty-icon">🔍</div>
            <h3>No matching orders found</h3>
            <p className="muted">Try adjusting your search query or filter selection.</p>
            <button
              className="outline-button"
              onClick={() => {
                setFilter("all");
                setSearch("");
              }}
            >
              Reset Filters
            </button>
          </section>
        ) : (
          /* List of Orders */
          <div className="orders-list">
            {filteredOrders.map((order) => {
              const statusObj = getOrderStatus(order);
              const canCancel =
                statusObj.step > 0 &&
                statusObj.step <= 2 &&
                order.status !== "Cancelled";

              const steps = [
                { num: 1, label: "Confirmed" },
                { num: 2, label: "Preparing" },
                { num: 3, label: "On the way" },
                { num: 4, label: "Delivered" },
              ];

              return (
                <article className="order-card" key={order.id}>
                  {/* Order Card Header */}
                  <div className="order-card-header">
                    <div className="order-card-id">
                      <div className="id-badge">
                        <span>Order</span> <strong>#{order.id}</strong>
                      </div>
                      <span className="order-date">
                        🕒 {order.createdAt || "Recently placed"}
                      </span>
                    </div>
                    <div className={`status-pill ${statusObj.statusClass}`}>
                      <span>{statusObj.icon}</span> {statusObj.label}
                    </div>
                  </div>

                  {/* Visual Tracker (Only for non-cancelled orders) */}
                  {statusObj.step > 0 && (
                    <div className="order-stepper">
                      <div className="stepper-line-bg">
                        <div
                          className="stepper-line-fill"
                          style={{
                            width: `${((Math.min(statusObj.step, 4) - 1) / 3) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="stepper-steps">
                        {steps.map((st) => {
                          const isCompleted = statusObj.step >= st.num;
                          const isCurrent = statusObj.step === st.num;
                          return (
                            <div
                              key={st.num}
                              className={`step-point ${isCompleted ? "completed" : ""} ${
                                isCurrent ? "current" : ""
                              }`}
                            >
                              <div className="step-circle">
                                {isCompleted && !isCurrent ? "✓" : st.num}
                              </div>
                              <span className="step-label">{st.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items in the Order */}
                  <div className="order-items-wrapper">
                    <h4>Items Ordered ({order.items?.length || 0})</h4>
                    <div className="order-items-list">
                      {order.items?.map((item) => (
                        <div className="order-item-row" key={item.id}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="order-item-img"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/100x100/f3e8dc/805b3b?text=Food";
                            }}
                          />
                          <div className="order-item-details">
                            <span className="order-item-name">{item.name}</span>
                            <span className="order-item-meta">
                              {item.category} · ₹{item.price} each
                            </span>
                          </div>
                          <div className="order-item-pricing">
                            <span className="order-item-qty">Qty: {item.quantity}</span>
                            <strong>₹{item.price * item.quantity}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details & Summary Grid */}
                  <div className="order-card-meta-grid">
                    <div className="meta-box address-meta">
                      <h5>📍 Delivery Address</h5>
                      <p>
                        <strong>{order.address?.fullName || order.customerName || "Customer"}</strong>
                        {order.address?.phone && <span> · {order.address.phone}</span>}
                      </p>
                      <p className="muted">
                        {[
                          order.address?.house,
                          order.address?.street,
                          order.address?.landmark,
                          order.address?.city,
                          order.address?.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>

                    <div className="meta-box bill-meta">
                      <h5>💳 Payment & Bill</h5>
                      <div className="bill-line">
                        <span>Payment Method</span>
                        <strong>{order.paymentMethod || "Cash on Delivery"}</strong>
                      </div>
                      <div className="bill-line">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="bill-line">
                        <span>Delivery Fee</span>
                        <span>₹{order.deliveryFee ?? 30}</span>
                      </div>
                      <div className="bill-total-line">
                        <strong>Total Paid</strong>
                        <strong className="total-highlight">₹{order.total}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="order-card-actions">
                    {canCancel && onCancelOrder && (
                      <button
                        className="text-button cancel-order-btn"
                        onClick={() => onCancelOrder(order.id)}
                      >
                        ✕ Cancel Order
                      </button>
                    )}
                    <button
                      className="primary-button reorder-btn"
                      onClick={() => onReorder(order)}
                    >
                      🔄 Reorder Items
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
