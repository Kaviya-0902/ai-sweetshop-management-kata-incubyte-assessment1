import { useEffect, useMemo, useState } from 'react'
import './App.css'


function sweetPlaceholderImageUrl(name) {
  const safe = encodeURIComponent(String(name || 'Sweet'))
  return `https://via.placeholder.com/640x420.png?text=${safe}`
}

function toUiSweet(dbSweet) {
  const name = dbSweet?.name ?? ''
  return {
    id: dbSweet?.id,
    name,
    description: '',
    price: Number(dbSweet?.price ?? 0),
    category: dbSweet?.category ?? '',
    stock: Number(dbSweet?.quantity ?? 0),
    imageUrl: dbSweet?.image_url || sweetPlaceholderImageUrl(name),
  }
}

function formatINR(value) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `₹${value}`
  }
}



function SweetShopPage({
  categories,
  filteredSweets,
  search,
  setSearch,
  category,
  setCategory,
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  cartItems,
  cartCount,
  cartTotal,
  addToCart,
  decrementCart,
  incrementCart,
  clearCart,
  onCheckout,
  checkoutBusy,
  status,
  formatINR,
  isLoggedIn,
  onLogin,
  onLogout,
}) {
  return (
    <div className="appShell">
      <aside className="sidebar leftSidebar">
        <div className="sidebarInner">
          <div className="sidebarHeader">
            <div className="sidebarTitle">Search & Filters</div>
          </div>

          <section className="section">
            <div className="sectionTitle">Search</div>
            <input
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sweets..."
              type="text"
            />
          </section>

          <section className="section">
            <div className="sectionTitle">Filters</div>

            <label className="label">
              Category
              <select
                className="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <label className="label">
              Max price: <span className="mono">{formatINR(maxPrice)}</span>
              <input
                className="range"
                type="range"
                min={50}
                max={500}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </label>

            <label className="checkRow">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In stock only
            </label>
          </section>
        </div>
      </aside>

      <main className="main">
        <div className="mainHeader">
          <div>
            <div className="title">Sweet Shop</div>
            <div className="subtitle">Browse sweets and add them to your cart</div>
          </div>
          <div className="headerActions">
            {!isLoggedIn ? (
              <button className="btn secondary" type="button" onClick={onLogin}>
                Login
              </button>
            ) : (
              <button className="btn secondary" type="button" onClick={onLogout}>
                Logout
              </button>
            )}
          </div>
        </div>

        {status ? (
          <div className={status.kind === 'error' ? 'authAlert error' : 'authAlert success'}>{status.message}</div>
        ) : null}

        <div className="grid">
          {filteredSweets.map((s) => {
            const disabled = s.stock <= 0
            return (
              <article key={s.id} className="card">
                <div className="imgWrap">
                  <img className="img" src={s.imageUrl} alt={s.name} />
                </div>

                <div className="cardBody">
                  <div className="cardTop">
                    <h3 className="cardTitle">{s.name}</h3>
                    <div className="badge">{s.category}</div>
                  </div>

                  <div className="desc">{s.description}</div>

                  <div className="meta">
                    <div className="price">{formatINR(s.price)}</div>
                    <div className={disabled ? 'stock out' : 'stock in'}>
                      {disabled ? 'Out of stock' : `${s.stock} available`}
                    </div>
                  </div>

                  <button
                    className="btn"
                    type="button"
                    disabled={disabled}
                    onClick={() => addToCart(s.id)}
                  >
                    Add to cart
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      <aside className="sidebar rightSidebar">
        <div className="sidebarInner">
          <div className="sidebarHeader">
            <div className="sidebarTitle">Cart</div>
            <div className="sidebarPill">Cart: {cartCount}</div>
          </div>

          <section className="section">
            <div className="sectionTitle">Cart</div>

            {cartItems.length === 0 ? (
              <div className="empty">Your cart is empty</div>
            ) : (
              <div className="cartList">
                {cartItems.map((it) => (
                  <div key={it.sweet.id} className="cartItem">
                    <div className="cartItemTop">
                      <div className="cartName">{it.sweet.name}</div>
                      <div className="cartLine">{formatINR(it.lineTotal)}</div>
                    </div>

                    <div className="cartControls">
                      <button
                        className="qtyBtn"
                        type="button"
                        onClick={() => decrementCart(it.sweet.id)}
                      >
                        −
                      </button>
                      <div className="qty">{it.qty}</div>
                      <button
                        className="qtyBtn"
                        type="button"
                        onClick={() => incrementCart(it.sweet.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="cartFooter">
              <div className="totalRow">
                <div className="totalLabel">Total</div>
                <div className="totalValue">{formatINR(cartTotal)}</div>
              </div>

              <div className="cartActions">
                <button className="btn secondary" type="button" onClick={clearCart}>
                  Clear
                </button>
                <button className="btn" type="button" disabled={cartItems.length === 0 || checkoutBusy} onClick={onCheckout}>
                  {checkoutBusy ? 'Please wait…' : 'Checkout'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

// =========================================================================
// ADMIN DASHBOARD COMPONENT (Admin View)
// =========================================================================


// =========================================================================
// MAIN APP COMPONENT
// =========================================================================

export default function App() {
  // --- SHOP STATE & LOGIC (Kept in App for now) ---
  const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8000'
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [maxPrice, setMaxPrice] = useState(500)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [cart, setCart] = useState(() => ({}))

  const [sweets, setSweets] = useState([])
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checkoutBusy, setCheckoutBusy] = useState(false)

  useEffect(() => {
    function syncAuth() {
      setToken(localStorage.getItem('token'))
    }

    window.addEventListener('storage', syncAuth)
    window.addEventListener('authchange', syncAuth)
    return () => {
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('authchange', syncAuth)
    }
  }, [])

  async function loadSweets() {
    setLoading(true)
    setStatus(null)
    try {
      const headers = {}
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`${apiBase}/api/sweets/`, { headers })

      const data = await res.json().catch(() => ([]))
      if (!res.ok) {
        const message = data?.detail || data?.message || 'Unable to load sweets'
        setStatus({ kind: 'error', message })
        return
      }

      setSweets(Array.isArray(data) ? data.map(toUiSweet) : [])
    } catch {
      setStatus({ kind: 'error', message: 'Unable to reach the server' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSweets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadSweets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(sweets.map((s) => s.category).filter(Boolean)))
    return ['All', ...unique]
  }, [sweets])

  const filteredSweets = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sweets.filter((s) => {
      const matchesQuery = !q || String(s.name ?? '').toLowerCase().includes(q)
      const matchesCategory = category === 'All' || s.category === category
      const matchesPrice = s.price <= maxPrice
      const matchesStock = !inStockOnly || s.stock > 0
      return matchesQuery && matchesCategory && matchesPrice && matchesStock
    })
  }, [search, category, maxPrice, inStockOnly, sweets])

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => {
        const numericId = Number(id)
        const sweet = sweets.find((s) => s.id === numericId)
        if (!sweet) return null
        return {
          sweet,
          qty,
          lineTotal: sweet.price * qty,
        }
      })
      .filter(Boolean)
  }, [cart, sweets])

  const cartCount = useMemo(() => cartItems.reduce((acc, it) => acc + it.qty, 0), [cartItems])
  const cartTotal = useMemo(
    () => cartItems.reduce((acc, it) => acc + it.lineTotal, 0),
    [cartItems],
  )

  function addToCart(sweetId) {
    setCart((prev) => {
      const sweet = sweets.find((s) => s.id === sweetId)
      if (!sweet) return prev
      const key = String(sweetId)
      const qty = prev[key] ?? 0
      if (qty >= Number(sweet.stock ?? 0)) return prev
      return { ...prev, [key]: qty + 1 }
    })
  }

  function decrementCart(sweetId) {
    setCart((prev) => {
      const key = String(sweetId)
      const qty = prev[key] ?? 0
      if (qty <= 1) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: qty - 1 }
    })
  }

  function incrementCart(sweetId) {
    setCart((prev) => {
      const sweet = sweets.find((s) => s.id === sweetId)
      if (!sweet) return prev
      const key = String(sweetId)
      const qty = prev[key] ?? 0
      if (qty >= Number(sweet.stock ?? 0)) return prev
      return { ...prev, [key]: qty + 1 }
    })
  }

  function clearCart() {
    setCart({})
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    window.dispatchEvent(new Event('authchange'))
  }

  function login() {
    window.location.hash = '#auth'
  }

  async function checkout() {
    if (!token) {
      login()
      return
    }

    const lines = Object.entries(cart)
      .map(([id, qty]) => ({ id: Number(id), qty: Number(qty) }))
      .filter((x) => Number.isFinite(x.id) && x.qty > 0)

    if (lines.length === 0) return

    setCheckoutBusy(true)
    setStatus(null)
    try {
      for (const line of lines) {
        const res = await fetch(`${apiBase}/api/sweets/${line.id}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: line.qty }),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          const message = data?.detail || data?.message || 'Checkout failed'
          setStatus({ kind: 'error', message })
          return
        }
      }

      setStatus({ kind: 'success', message: 'Checkout successful' })
      clearCart()
      await loadSweets()
    } catch {
      setStatus({ kind: 'error', message: 'Unable to reach the server' })
    } finally {
      setCheckoutBusy(false)
    }
  }

  return (
    <SweetShopPage
      categories={categories}
      filteredSweets={filteredSweets}
      search={search}
      setSearch={setSearch}
      category={category}
      setCategory={setCategory}
      maxPrice={maxPrice}
      setMaxPrice={setMaxPrice}
      inStockOnly={inStockOnly}
      setInStockOnly={setInStockOnly}
      cartItems={cartItems}
      cartCount={cartCount}
      cartTotal={cartTotal}
      addToCart={addToCart}
      decrementCart={decrementCart}
      incrementCart={incrementCart}
      clearCart={clearCart}
      onCheckout={checkout}
      checkoutBusy={checkoutBusy || loading}
      status={status}
      formatINR={formatINR}
      isLoggedIn={Boolean(token)}
      onLogin={login}
      onLogout={logout}
    />
  )
}