import { useEffect, useState } from "react";
import OrderHistory from "./OrderHistory";
import "./App.css";

const foods = [
  { id: 1, name: "Chicken Biryani", category: "Biryani", price: 220, rating: 4.5, time: "25 min", image: "https://static.vecteezy.com/system/resources/previews/071/195/887/non_2x/delicious-chicken-biryani-with-spiced-rice-garnished-with-lemon-onion-and-coriander-served-in-wooden-bowl-traditional-indian-food-png.png" },
  { id: 2, name: "Veg Pizza", category: "Pizza", price: 199, rating: 4.3, time: "20 min", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700" },
  { id: 3, name: "Cheese Burger", category: "Burger", price: 149, rating: 4.4, time: "15 min", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700" },
  { id: 4, name: "Idli", category: "South Indian", price: 99, rating: 4.6, time: "20 min", image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=700" },
  { id: 5, name: "Paneer Biryani", category: "Biryani", price: 180, rating: 4.2, time: "25 min", image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=700" },
  { id: 6, name: "Margherita Pizza", category: "Pizza", price: 249, rating: 4.7, time: "30 min", image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700" },
  { id: 7, name: "French Fries", category: "Snacks", price: 99, rating: 4.1, time: "15 min", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700" },
  { id: 8, name: "Chocolate Cake", category: "Desserts", price: 129, rating: 4.8, time: "20 min", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700" },
];

const categories = ["All", "Biryani", "Pizza", "Burger", "South Indian", "Snacks", "Desserts"];

function Auth({ onSuccess, onBack }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("foodieUsers") || "[]");
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      if (users.some((item) => item.email === normalizedEmail)) {
        setError("This email is already registered. Please log in.");
        return;
      }
      // Demo only: never store real passwords this way in a production app.
      const newUser = { name: name.trim(), email: normalizedEmail, password };
      localStorage.setItem("foodieUsers", JSON.stringify([...users, newUser]));
      onSuccess({ name: newUser.name, email: newUser.email });
    } else {
      const found = users.find((item) => item.email === normalizedEmail && item.password === password);
      if (!found) {
        setError("Invalid email or password. Please try again or sign up.");
        return;
      }
      onSuccess({ name: found.name, email: found.email });
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <button className="text-button" onClick={onBack}>← Back to menu</button>
        <div className="brand">🍴 Foodie</div>
        <h1>{mode === "login" ? "Welcome back!" : "Create your account"}</h1>
        <p className="muted">{mode === "login" ? "Login to continue ordering." : "Sign up to order your favorite meals."}</p>
        <form onSubmit={submit} className="form-stack">
          {mode === "signup" && <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" /></label>}
          <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input required minLength="6" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
          {error && <p className="error-message">{error}</p>}
          <button className="primary-button" type="submit">{mode === "login" ? "Login" : "Create account"}</button>
        </form>
        <p className="switch-text">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button className="text-button accent" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
            {mode === "login" ? "Sign up" : "Login"}
          </button>
        </p>
        <p className="tiny-note">Demo authentication only. Do not use a real password.</p>
      </section>
    </main>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("foodieCurrentUser") || "null"); }
    catch { return null; }
  });
  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("foodieOrders") || "[]"); }
    catch { return []; }
  });
  const [address, setAddress] = useState({
    fullName: "", phone: "", house: "", street: "", landmark: "", city: "", pincode: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [orderPlaced, setOrderPlaced] = useState(null);

  useEffect(() => {
    if (user) localStorage.setItem("foodieCurrentUser", JSON.stringify(user));
    else localStorage.removeItem("foodieCurrentUser");
  }, [user]);

  useEffect(() => {
    localStorage.setItem("foodieOrders", JSON.stringify(orders));
  }, [orders]);

  const filteredFoods = foods.filter((food) => {
    const categoryMatch = category === "All" || food.category === category;
    const searchMatch = food.name.toLowerCase().includes(search.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const total = subtotal + deliveryFee;

  const userOrders = user
    ? orders.filter((o) => !o.userEmail || o.userEmail === user.email || o.userEmail === "guest")
    : orders;

  function addToCart(food) {
    setCart((items) => {
      const existing = items.find((item) => item.id === food.id);
      return existing
        ? items.map((item) => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...food, quantity: 1 }];
    });
  }

  function changeQuantity(id, change) {
    setCart((items) => items
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  }

  function beginCheckout() {
    if (!cart.length) return;
    setShowCart(false);
    if (!user) {
      setShowAuth(true);
      return;
    }
    setAddress((old) => ({
      ...old,
      fullName: old.fullName || user.name || "",
    }));
    setShowCheckout(true);
  }

  function confirmOrder(event) {
    event.preventDefault();
    if (!cart.length) return;

    const order = {
      id: `FD${Date.now().toString().slice(-7)}`,
      userEmail: user?.email || "guest",
      customerName: address.fullName || user?.name || "Customer",
      items: [...cart],
      address: { ...address },
      paymentMethod,
      subtotal,
      deliveryFee,
      total,
      status: "Confirmed",
      createdAt: new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      timestamp: Date.now(),
    };
    setOrders((prev) => [order, ...prev]);
    setOrderPlaced(order);
    setCart([]);
    setShowCheckout(false);
  }

  function handleReorder(order) {
    setCart((prevCart) => {
      let updated = [...prevCart];
      order.items?.forEach((item) => {
        const found = updated.find((ci) => ci.id === item.id);
        if (found) {
          found.quantity += item.quantity;
        } else {
          updated.push({ ...item });
        }
      });
      return updated;
    });
    setShowOrders(false);
    setShowCart(true);
  }

  function handleCancelOrder(orderId) {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: "Cancelled" } : ord))
      );
    }
  }

  function addDemoOrder() {
    const demo = {
      id: `FD${Math.floor(1000000 + Math.random() * 9000000)}`,
      userEmail: user?.email || "guest",
      customerName: user?.name || "Valued Customer",
      items: [
        {
          id: 1,
          name: "Chicken Biryani",
          category: "Biryani",
          price: 220,
          quantity: 2,
          image: "https://static.vecteezy.com/system/resources/previews/071/195/887/non_2x/delicious-chicken-biryani-with-spiced-rice-garnished-with-lemon-onion-and-coriander-served-in-wooden-bowl-traditional-indian-food-png.png",
        },
        {
          id: 8,
          name: "Chocolate Cake",
          category: "Desserts",
          price: 129,
          quantity: 1,
          image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700",
        },
      ],
      address: {
        fullName: user?.name || "Foodie Customer",
        phone: "9876543210",
        house: "Flat 402, Green Meadows",
        street: "12th Main Road, Indiranagar",
        landmark: "Near Metro Station",
        city: "Bengaluru",
        pincode: "560038",
      },
      paymentMethod: "UPI (Demo)",
      subtotal: 569,
      deliveryFee: 30,
      total: 599,
      status: "Confirmed",
      createdAt: new Date(Date.now() - 1000 * 60 * 4).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      timestamp: Date.now() - 1000 * 60 * 4,
    };
    setOrders((prev) => [demo, ...prev]);
  }

  function updateAddress(field, value) {
    setAddress((old) => ({ ...old, [field]: value }));
  }

  if (showAuth) {
    return <Auth
      onBack={() => setShowAuth(false)}
      onSuccess={(loggedInUser) => {
        setUser(loggedInUser);
        setShowAuth(false);
        setAddress((old) => ({ ...old, fullName: old.fullName || loggedInUser.name }));
        if (cart.length) setShowCheckout(true);
      }}
    />;
  }

  if (orderPlaced) {
    return (
      <main className="confirmation-page">
        <section className="confirmation-card">
          <div className="success-mark">✓</div>
          <h1>Order placed successfully!</h1>
          <p className="muted">Thank you, {orderPlaced.address.fullName}. Your demo order has been received.</p>
          <div className="order-detail"><span>Order ID</span><strong>{orderPlaced.id}</strong></div>
          <div className="order-detail"><span>Delivery to</span><strong>{orderPlaced.address.house}, {orderPlaced.address.street}, {orderPlaced.address.city} - {orderPlaced.address.pincode}</strong></div>
          <div className="order-detail"><span>Payment method</span><strong>{orderPlaced.paymentMethod}</strong></div>
          <div className="order-detail"><span>Total</span><strong>₹{orderPlaced.total}</strong></div>
          <div className="confirmation-actions">
            <button className="primary-button full-button" onClick={() => { setOrderPlaced(null); setShowOrders(true); }}>
              View in Order History →
            </button>
            <button className="outline-button full-button" onClick={() => setOrderPlaced(null)}>
              Continue shopping
            </button>
          </div>
          <p className="tiny-note">This is a frontend demo. No restaurant, courier, or payment service was contacted.</p>
        </section>
      </main>
    );
  }

  if (showOrders) {
    return (
      <OrderHistory
        orders={orders}
        user={user}
        onBack={() => setShowOrders(false)}
        onReorder={handleReorder}
        onCancelOrder={handleCancelOrder}
        onLogin={() => {
          setShowOrders(false);
          setShowAuth(true);
        }}
        onAddDemoOrder={addDemoOrder}
      />
    );
  }

  if (showCheckout) {
    return (
      <main className="checkout-page">
        <section className="checkout-card">
          <button className="text-button" onClick={() => setShowCheckout(false)}>← Back to menu</button>
          <div className="brand">🍴 Foodie</div>
          <h1>Checkout</h1>
          <p className="muted">Where should we deliver your order?</p>

          <form onSubmit={confirmOrder}>
            <h2>Delivery address</h2>
            <div className="checkout-grid">
              <label>Full name<input required value={address.fullName} onChange={(e) => updateAddress("fullName", e.target.value)} placeholder="Recipient name" /></label>
              <label>Mobile number<input required type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength="10" value={address.phone} onChange={(e) => updateAddress("phone", e.target.value.replace(/\\D/g, ""))} placeholder="10-digit mobile number" /></label>
              <label className="wide-field">House / Flat / Building<input required value={address.house} onChange={(e) => updateAddress("house", e.target.value)} placeholder="Flat number, building name" /></label>
              <label className="wide-field">Street / Area<input required value={address.street} onChange={(e) => updateAddress("street", e.target.value)} placeholder="Street, area, locality" /></label>
              <label className="wide-field">Landmark (optional)<input value={address.landmark} onChange={(e) => updateAddress("landmark", e.target.value)} placeholder="Nearby landmark" /></label>
              <label>City<input required value={address.city} onChange={(e) => updateAddress("city", e.target.value)} placeholder="Your city" /></label>
              <label>PIN code<input required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={address.pincode} onChange={(e) => updateAddress("pincode", e.target.value.replace(/\\D/g, ""))} placeholder="6-digit PIN code" /></label>
            </div>

            <h2>Choose payment method</h2>
            <div className="payment-list">
              {[
                { value: "Cash on Delivery", detail: "Pay when your food arrives", icon: "💵" },
                { value: "UPI (Demo)", detail: "Google Pay, PhonePe, Paytm — demo selection only", icon: "📱" },
                { value: "Credit / Debit Card (Demo)", detail: "Demo selection only; do not enter card details", icon: "💳" },
              ].map((method) => (
                <label className={`payment-option ${paymentMethod === method.value ? "selected" : ""}`} key={method.value}>
                  <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span className="payment-icon">{method.icon}</span>
                  <span className="payment-copy"><strong>{method.value}</strong><small>{method.detail}</small></span>
                </label>
              ))}
            </div>

            <div className="summary-box">
              <h2>Order summary</h2>
              {cart.map((item) => <p className="summary-line" key={item.id}><span>{item.name} × {item.quantity}</span><span>₹{item.price * item.quantity}</span></p>)}
              <p className="summary-line"><span>Subtotal</span><span>₹{subtotal}</span></p>
              <p className="summary-line"><span>Delivery fee</span><span>₹{deliveryFee}</span></p>
              <h3 className="summary-total"><span>Total to pay</span><span>₹{total}</span></h3>
            </div>
            <p className="tiny-note">Demo checkout only. UPI/card options do not process payments. Real payments need a secure payment gateway and backend.</p>
            <button className="primary-button full-button" type="submit">Confirm order · ₹{total}</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a className="brand nav-brand" href="#home" onClick={() => setShowOrders(false)}>🍴 Foodie</a>
        <div className="nav-links">
          <a href="#home" onClick={() => setShowOrders(false)}>Home</a>
          <a href="#menu" onClick={() => setShowOrders(false)}>Menu</a>
          <a href="#about" onClick={() => setShowOrders(false)}>About</a>
          <button className="orders-nav-btn" onClick={() => setShowOrders(true)}>
            📦 Orders {userOrders.length > 0 && <span className="nav-badge">{userOrders.length}</span>}
          </button>
          {user ? (
            <>
              <span className="welcome-user">Hi, {user.name.split(" ")[0]}</span>
              <button className="outline-button" onClick={() => setUser(null)}>Logout</button>
            </>
          ) : (
            <button className="outline-button" onClick={() => setShowAuth(true)}>Login / Sign up</button>
          )}
          <button className="primary-button cart-nav" onClick={() => setShowCart(true)}>🛒 Cart ({totalItems})</button>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content"><span className="eyebrow">Delicious food, delivered fast</span><h1>Hungry? Order your favorite food.</h1><p>Discover delicious meals from your favorite restaurants and get them delivered to your doorstep.</p><a href="#menu" className="primary-button hero-button">Explore Menu →</a></div>
      </section>

      <main className="menu-section" id="menu">
        <div className="section-heading"><div><h2>Explore Our Menu</h2><p>Find your favorite food today!</p></div><input className="search-input" type="search" placeholder="🔍 Search food..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <div className="categories">{categories.map((item) => <button key={item} className={`category ${category === item ? "active" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <div className="food-grid">
          {filteredFoods.map((food) => <article className="food-card" key={food.id}>
            <img src={food.image} alt={food.name} loading="lazy" onError={(e) => { e.currentTarget.src = "https://placehold.co/700x450/f3e8dc/805b3b?text=Food+Image"; }} />
            <div className="food-info"><div className="food-title"><h3>{food.name}</h3><span className="rating">⭐ {food.rating}</span></div><p>{food.category} · {food.time}</p><div className="food-bottom"><strong>₹{food.price}</strong><button onClick={() => addToCart(food)}>+ Add</button></div></div>
          </article>)}
        </div>
        {filteredFoods.length === 0 && <p className="no-results">No food items found. Try another search.</p>}
      </main>

      <section className="about-section" id="about"><h2>Good food. Good mood.</h2><p>Foodie is a React food ordering demo project.</p></section>
      <footer><h2>🍴 Foodie</h2><p>Good food. Good mood. Delivered with love.</p><p>© 2026 Foodie. Learning project.</p></footer>

      {showCart && <div className="cart-overlay" onClick={() => setShowCart(false)}>
        <aside className="cart-panel" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header"><h2>Your Cart 🛒</h2><button className="close-button" onClick={() => setShowCart(false)}>✕</button></div>
          {cart.length === 0 ? <div className="empty-cart"><div>🛍️</div><h3>Your cart is empty</h3><p>Add some delicious food to get started.</p><button className="primary-button full-button" onClick={() => setShowCart(false)}>Browse menu</button></div> :
            <>{cart.map((item) => <div className="cart-item" key={item.id}><div><h4>{item.name}</h4><p>₹{item.price} × {item.quantity}</p></div><div className="quantity"><button onClick={() => changeQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)}>+</button></div></div>)}
              <div className="bill"><p>Subtotal <span>₹{subtotal}</span></p><p>Delivery fee <span>₹{deliveryFee}</span></p><h3>Total <span>₹{total}</span></h3></div>
              <button className="primary-button full-button" onClick={beginCheckout}>{user ? "Proceed to checkout" : "Login to continue"}</button>
              <p className="tiny-note center-note">Login is required before checkout.</p></>}
        </aside>
      </div>}
    </div>
  );
}
