import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  checkout,
  deleteProduct,
  listOrders,
  listProducts,
  login,
  register,
  saveProduct
} from "./api";
import type { Cart, Order, Product, Session } from "./types";

const storedSession = localStorage.getItem("storemesh.session");
const categories = ["แฟชั่น", "เครื่องใช้", "รองเท้า", "กระเป๋า", "สุขภาพ", "ความงาม", "อุปกรณ์", "อื่น ๆ"];

export default function App() {
  const [session, setSession] = useState<Session | null>(storedSession ? JSON.parse(storedSession) : null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [editing, setEditing] = useState<Product | null>(null);
  const [filters, setFilters] = useState({ search: "", min_price: "", max_price: "", in_stock: false });
  const [message, setMessage] = useState("");

  const token = session?.access;
  const role = session?.user.role;

  useEffect(() => {
    void loadProducts();
  }, [session, filters]);

  useEffect(() => {
    if (message) {
      const timer = window.setTimeout(() => setMessage(""), 3000);
      return () => window.clearTimeout(timer);
    }
  }, [message]);

  async function loadProducts() {
    const params = new URLSearchParams();
    if (role === "seller") params.set("mine", "true");
    if (role === "buyer") {
      if (filters.search) params.set("search", filters.search);
      if (filters.min_price) params.set("min_price", filters.min_price);
      if (filters.max_price) params.set("max_price", filters.max_price);
      if (filters.in_stock) params.set("in_stock", "true");
    }
    setProducts(await listProducts(params, token));
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const nextSession = authMode === "login" ? await login(data) : await register(data);
    setSession(nextSession);
    localStorage.setItem("storemesh.session", JSON.stringify(nextSession));
    setMessage(`Signed in as ${nextSession.user.role}`);
  }

  function logout() {
    setSession(null);
    setCart({});
    setOrders([]);
    localStorage.removeItem("storemesh.session");
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const formData = new FormData(event.currentTarget);
    const image = formData.get("image");
    if (image instanceof File && image.size === 0) formData.delete("image");

    await saveProduct(formData, token, editing?.id);
    setEditing(null);
    event.currentTarget.reset();
    setMessage("Product saved.");
    await loadProducts();
  }

  async function removeProduct(product: Product) {
    if (!token) return;
    await deleteProduct(product.id, token);
    setMessage("Product deleted.");
    await loadProducts();
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const quantity = current[product.id] || 0;
      if (quantity >= product.quantity) {
        setMessage("No more stock available.");
        return current;
      }
      return { ...current, [product.id]: quantity + 1 };
    });
  }

  async function placeOrder() {
    if (!token) return;
    const items = (Object.entries(cart) as [string, number][]).map(([productId, quantity]) => ({
      product_id: Number(productId),
      quantity
    }));
    if (!items.length) return setMessage("Add items before checkout.");
    await checkout(items, token);
    setCart({});
    setMessage("Order placed.");
    await loadProducts();
  }

  async function openOrders() {
    if (!token) return;
    setOrders(await listOrders(token));
  }

  const cartLines = useMemo(
    () =>
      (Object.entries(cart) as [string, number][])
        .map(([id, quantity]) => ({ product: products.find((item) => item.id === Number(id)), quantity }))
        .filter((line): line is { product: Product; quantity: number } => Boolean(line.product)),
    [cart, products]
  );

  const cartTotal = cartLines.reduce((sum, line) => sum + Number(line.product.unit_price) * line.quantity, 0);

  return (
    <>
      <header className="app-header">
        <div className="brand-mark">
          <span className="brand-icon">S</span>
          <strong>ShopEase</strong>
        </div>
        <div className="header-search">
          <input
            placeholder="ค้นหาสินค้า เช่น กระเป๋า, รองเท้า, นาฬิกา..."
            value={filters.search}
            onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          />
          <button className="search-button" type="button">ค้นหา</button>
        </div>
        {session && (
          <nav className="header-actions">
            <button className="icon-nav" onClick={openOrders} type="button">
              <span>O</span>
              <small>ออเดอร์</small>
            </button>
            <button className="icon-nav" type="button">
              <span>{cartLines.length}</span>
              <small>ตะกร้า</small>
            </button>
            <button className="icon-nav" onClick={logout} type="button">
              <span>{session.user.role === "seller" ? "S" : "B"}</span>
              <small>ออกจากระบบ</small>
            </button>
          </nav>
        )}
      </header>

      <main className="page-shell">
        {!session && (
          <section className="auth-layout">
            <div className="auth-hero">
              <p className="eyebrow">StoreFront Management System</p>
              <h2>เลือกสิ่งที่ใช่ในสไตล์คุณ</h2>
              <p>ระบบ marketplace สำหรับผู้ขายและผู้ซื้อ พร้อมสินค้า ตะกร้า ออเดอร์ และการจัดการสต็อกครบในที่เดียว</p>
            </div>
            <form className="panel" onSubmit={submitAuth}>
              <div className="tabs">
                <button type="button" className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")}>Login</button>
                <button type="button" className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")}>Register</button>
              </div>
              {authMode === "register" && (
                <>
                  <label>Username<input name="username" required /></label>
                  <label>Role<select name="role"><option value="buyer">Buyer</option><option value="seller">Seller</option></select></label>
                </>
              )}
              <label>Email<input name="email" type="email" required /></label>
              <label>Password<input name="password" type="password" minLength={8} required /></label>
              <button className="primary">Continue</button>
            </form>
          </section>
        )}

        {role === "seller" && (
          <section className="seller-page">
            <div className="seller-hero">
              <div>
                <p className="eyebrow">Seller Center</p>
                <h2>จัดการสินค้าให้พร้อมขาย</h2>
                <p>เพิ่มรูป ราคา และจำนวนคงเหลือ ระบบจะจำกัดสิทธิ์ให้แก้ไขได้เฉพาะสินค้าของคุณ</p>
              </div>
              <div className="seller-stat">
                <strong>{products.length}</strong>
                <span>รายการสินค้า</span>
              </div>
            </div>
            <div className="seller-layout">
            <form className="panel" onSubmit={submitProduct}>
              <h2>{editing ? "Edit product" : "Add product"}</h2>
              <label>Title<input name="title" defaultValue={editing?.title} required /></label>
              <label>Description<textarea name="description" defaultValue={editing?.description} required /></label>
              <div className="form-row">
                <label>Unit price<input name="unit_price" type="number" min="0" step="0.01" defaultValue={editing?.unit_price} required /></label>
                <label>Quantity<input name="quantity" type="number" min="0" step="1" defaultValue={editing?.quantity} required /></label>
              </div>
              <label>Image<input name="image" type="file" accept="image/*" /></label>
              <div className="form-actions">
                <button className="primary">Save</button>
                <button type="button" onClick={() => setEditing(null)}>Reset</button>
              </div>
            </form>
            <ProductList products={products} onEdit={setEditing} onDelete={removeProduct} />
            </div>
          </section>
        )}

        {role === "buyer" && (
          <section className="storefront-page">
            <nav className="mini-nav">
              <a>หมวดหมู่สินค้า</a>
              <a className="active">หน้าแรก</a>
              <a>สินค้าใหม่</a>
              <a>สินค้าขายดี</a>
              <a>โปรโมชั่น</a>
              <a>บทความ</a>
              <a>ติดต่อเรา</a>
            </nav>

            <section className="hero-banner">
              <div>
                <p className="eyebrow">อัปเดตดีลคุณภาพ</p>
                <h2>เลือกสิ่งที่ใช่ในสไตล์คุณ</h2>
                <p>รวมสินค้าจากหลายผู้ขาย พร้อมค้นหา เปรียบเทียบราคา และเช็กสต็อกก่อนสั่งซื้อ</p>
                <div className="hero-actions">
                  <button className="primary" type="button">ช้อปเลย</button>
                  <button type="button">ดูสินค้าใหม่</button>
                </div>
              </div>
              <div className="hero-product" aria-hidden="true">
                <div className="bag-shape"></div>
                <div className="watch-shape"></div>
                <div className="plant-shape"></div>
              </div>
            </section>

            <section className="category-strip">
              {categories.map((category, index) => (
                <button className="category-chip" key={category} type="button">
                  <span>{category.slice(0, 1)}{index + 1}</span>
                  {category}
                </button>
              ))}
            </section>

            <section className="promo-grid">
              <article className="promo-card sale">
                <p>ลดแรงสุด</p>
                <h3>สูงสุด 50%</h3>
                <button type="button">ช้อปเลย</button>
              </article>
              <article className="promo-card delivery">
                <p>ส่งฟรี</p>
                <h3>ทั่วประเทศ</h3>
                <span>เมื่อสั่งครบตามกำหนด</span>
              </article>
              <article className="promo-card voucher">
                <p>ลูกค้าใหม่</p>
                <h3>รับส่วนลด 100.-</h3>
                <span>ใช้ได้ทันทีหลังสมัคร</span>
              </article>
            </section>

            <div className="store-section-title">
              <div>
                <h2>สินค้าแนะนำ</h2>
                <p>{products.length} รายการพร้อมจำหน่าย</p>
              </div>
              <div className="toolbar">
                <input placeholder="ราคาต่ำสุด" value={filters.min_price} onChange={(event) => setFilters({ ...filters, min_price: event.target.value })} />
                <input placeholder="ราคาสูงสุด" value={filters.max_price} onChange={(event) => setFilters({ ...filters, max_price: event.target.value })} />
                <label className="check-row"><input type="checkbox" checked={filters.in_stock} onChange={(event) => setFilters({ ...filters, in_stock: event.target.checked })} /> มีสินค้า</label>
              </div>
            </div>
            <div className="content-grid">
              <Marketplace products={products} onAdd={addToCart} />
              <aside className="panel cart-panel">
                <h2>Cart</h2>
                {cartLines.map(({ product, quantity }) => (
                  <div className="cart-row" key={product.id}>
                    <strong>{product.title}</strong>
                    <span>${product.unit_price} x {quantity}</span>
                  </div>
                ))}
                <strong>Total: ${cartTotal.toFixed(2)}</strong>
                <button className="primary" onClick={placeOrder}>Checkout</button>
              </aside>
            </div>
          </section>
        )}

        {orders.length > 0 && (
          <section className="orders panel">
            <h2>Orders</h2>
            {orders.map((order) => (
              <article key={order.id}>
                <strong>Order #{order.id} - ${order.total}</strong>
                {order.items.map((item) => <p key={item.id}>{item.title} x {item.quantity}</p>)}
              </article>
            ))}
          </section>
        )}
      </main>

      {message && <div className="toast">{message}</div>}
      {session && (
        <footer className="site-footer">
          <div><strong>ShopEase</strong><p>StoreFront Management System</p></div>
          <div><strong>บริการ</strong><p>ชำระเงินปลอดภัย · จัดส่งรวดเร็ว · ติดตามออเดอร์</p></div>
          <div><strong>ช่วยเหลือ</strong><p>ศูนย์ช่วยเหลือ · เงื่อนไขการใช้งาน</p></div>
        </footer>
      )}
    </>
  );
}

function Marketplace({ products, onAdd }: { products: Product[]; onAdd: (product: Product) => void }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card" key={product.id}>
          <button className="wishlist-button" type="button" aria-label="Add to wishlist">♡</button>
          {product.image ? <img src={product.image} alt={product.title} /> : <div className="placeholder">No image</div>}
          <div className="product-info">
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <div className="rating-line"><span>★★★★★</span><small>{product.quantity} in stock</small></div>
            <div className="price-row">
              <strong>${product.unit_price}</strong>
              <button disabled={product.quantity === 0} onClick={() => onAdd(product)}>เพิ่ม</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ProductList({
  products,
  onEdit,
  onDelete
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}) {
  return (
    <div className="product-list">
      <h2>My listings</h2>
      {products.map((product) => (
        <article className="listing-row" key={product.id}>
          <div>
            <h3>{product.title}</h3>
            <p>${product.unit_price} · {product.quantity} in stock</p>
          </div>
          <div className="form-actions">
            <button onClick={() => onEdit(product)}>Edit</button>
            <button onClick={() => onDelete(product)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  );
}
