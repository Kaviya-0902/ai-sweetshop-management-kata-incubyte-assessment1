import { useEffect, useMemo, useState } from 'react'

export default function AdminDashboard() {
  const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || 'http://localhost:8000'
  const token = useMemo(() => localStorage.getItem('token'), [])
  const role = useMemo(() => localStorage.getItem('role'), [])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)
  const [query, setQuery] = useState('')

  const [createForm, setCreateForm] = useState({ name: '', category: '', price: '', quantity: '', image_url: '' })

  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', category: '', price: '', quantity: '', image_url: '' })

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    window.location.hash = '#auth'
    window.dispatchEvent(new Event('authchange'))
  }

  async function load() {
    if (!token) {
      setStatus({ kind: 'error', message: 'Please login again.' })
      logout()
      return
    }

    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(`${apiBase}/api/sweets/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json().catch(() => ([]))
      if (!res.ok) {
        const message = data?.detail || data?.message || 'Unable to load sweets'
        setStatus({ kind: 'error', message })
        return
      }
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setStatus({ kind: 'error', message: 'Unable to reach the server' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      window.location.hash = '#auth'
      window.dispatchEvent(new Event('authchange'))
      return
    }

    if (role !== 'admin') {
      window.location.hash = '#shop'
      return
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startEdit(it) {
    setStatus(null)
    setEditId(it.id)
    setEditForm({
      name: it.name ?? '',
      category: it.category ?? '',
      price: String(it.price ?? ''),
      quantity: String(it.quantity ?? ''),
      image_url: it.image_url ?? '',
    })
  }

  function cancelEdit() {
    setEditId(null)
    setEditForm({ name: '', category: '', price: '', quantity: '', image_url: '' })
  }

  async function createSweet(e) {
    e.preventDefault()
    setStatus(null)

    if (!createForm.name.trim()) {
      setStatus({ kind: 'error', message: 'Name is required' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: createForm.name.trim(),
        category: createForm.category.trim(),
        price: Number(createForm.price),
        quantity: Number(createForm.quantity),
        image_url: createForm.image_url.trim() || null,
      }

      const res = await fetch(`${apiBase}/api/sweets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = data?.detail || data?.message || 'Unable to add sweet'
        setStatus({ kind: 'error', message })
        return
      }

      setCreateForm({ name: '', category: '', price: '', quantity: '', image_url: '' })
      setStatus({ kind: 'success', message: data?.message || 'Sweet added' })
      await load()
    } catch {
      setStatus({ kind: 'error', message: 'Unable to reach the server' })
    } finally {
      setSaving(false)
    }
  }

  async function updateSweet(e) {
    e.preventDefault()
    if (editId == null) return
    setStatus(null)
    setSaving(true)
    try {
      const payload = {
        name: editForm.name.trim() || undefined,
        category: editForm.category.trim() || undefined,
        price: editForm.price === '' ? undefined : Number(editForm.price),
        quantity: editForm.quantity === '' ? undefined : Number(editForm.quantity),
        image_url: editForm.image_url.trim() === '' ? undefined : editForm.image_url.trim(),
      }

      const res = await fetch(`${apiBase}/api/sweets/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = data?.detail || data?.message || 'Unable to update sweet'
        setStatus({ kind: 'error', message })
        return
      }

      setStatus({ kind: 'success', message: data?.message || 'Sweet updated' })
      cancelEdit()
      await load()
    } catch {
      setStatus({ kind: 'error', message: 'Unable to reach the server' })
    } finally {
      setSaving(false)
    }
  }

  async function deleteSweet(id) {
    setStatus(null)
    setSaving(true)
    try {
      const res = await fetch(`${apiBase}/api/sweets/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const message = data?.detail || data?.message || 'Unable to delete sweet'
        setStatus({ kind: 'error', message })
        return
      }
      setStatus({ kind: 'success', message: data?.message || 'Sweet deleted' })
      await load()
    } catch {
      setStatus({ kind: 'error', message: 'Unable to reach the server' })
    } finally {
      setSaving(false)
    }
  }

  const q = query.trim().toLowerCase()
  const filteredItems = items.filter((it) => {
    if (!q) return true
    return (
      String(it.name ?? '').toLowerCase().includes(q) ||
      String(it.category ?? '').toLowerCase().includes(q) ||
      String(it.id ?? '').toLowerCase().includes(q)
    )
  })

  const totalSkus = items.length
  const totalStock = items.reduce((acc, it) => acc + Number(it.quantity ?? 0), 0)
  const categoryCount = new Set(items.map((it) => it.category).filter(Boolean)).size
  const lowStockCount = items.filter((it) => Number(it.quantity ?? 0) > 0 && Number(it.quantity ?? 0) <= 5).length

  return (
    <div className="appShell adminShell">
      <main className="main">
        <div className="mainHeader">
          <div>
            <div className="title">Admin Dashboard</div>
            <div className="subtitle">Manage sweets inventory (CRUD)</div>
          </div>
          <div className="headerActions">
            <button className="btn secondary" type="button" onClick={load} disabled={loading || saving}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button className="btn secondary" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <section className="adminContent">
          {status ? (
            <div className={status.kind === 'error' ? 'authAlert error' : 'authAlert success'}>{status.message}</div>
          ) : null}

          <div className="adminStats">
            <div className="adminStat">
              <div className="adminStatLabel">Total items</div>
              <div className="adminStatValue">{totalSkus}</div>
            </div>
            <div className="adminStat">
              <div className="adminStatLabel">Total stock</div>
              <div className="adminStatValue">{totalStock}</div>
            </div>
            <div className="adminStat">
              <div className="adminStatLabel">Categories</div>
              <div className="adminStatValue">{categoryCount}</div>
            </div>
            <div className="adminStat">
              <div className="adminStatLabel">Low stock (≤ 5)</div>
              <div className="adminStatValue">{lowStockCount}</div>
            </div>
          </div>

          <div className="adminLayout">
            <div className="adminCard">
              <div className="adminCardHeader">
                <div>
                  <div className="adminCardTitle">Add new sweet</div>
                  <div className="adminCardSub">Create an item in the inventory</div>
                </div>
              </div>

              <form className="adminForm" onSubmit={createSweet}>
                <label className="authLabel">
                  Name
                  <input
                    className="input"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Gulab Jamun"
                    required
                  />
                </label>

                <label className="authLabel">
                  Category
                  <input
                    className="input"
                    value={createForm.category}
                    onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="e.g. Milk-based"
                  />
                </label>

                <label className="authLabel">
                  Image URL
                  <input
                    className="input"
                    value={createForm.image_url}
                    onChange={(e) => setCreateForm((p) => ({ ...p, image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </label>

                <div className="adminFormRow">
                  <label className="authLabel">
                    Price
                    <input
                      className="input"
                      value={createForm.price}
                      onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))}
                      placeholder="120"
                      inputMode="decimal"
                      required
                    />
                  </label>

                  <label className="authLabel">
                    Quantity
                    <input
                      className="input"
                      value={createForm.quantity}
                      onChange={(e) => setCreateForm((p) => ({ ...p, quantity: e.target.value }))}
                      placeholder="50"
                      inputMode="numeric"
                      required
                    />
                  </label>
                </div>

                <button className="btn" type="submit" disabled={saving}>
                  {saving ? 'Please wait…' : 'Add sweet'}
                </button>
              </form>
            </div>

            <div className="adminCard">
              <div className="adminCardHeader adminCardHeaderRow">
                <div>
                  <div className="adminCardTitle">Inventory</div>
                  <div className="adminCardSub">Search, edit, and remove items</div>
                </div>
                <input
                  className="input adminSearch"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name / category / id"
                  type="text"
                />
              </div>

              {loading ? (
                <div className="empty">Loading…</div>
              ) : filteredItems.length === 0 ? (
                <div className="empty">No sweets found</div>
              ) : (
                <div className="adminTableWrap">
                  <table className="adminTable">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th className="num">Image</th>
                        <th className="num">Price</th>
                        <th className="num">Qty</th>
                        <th className="num">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((it) => {
                        const isEditing = editId === it.id
                        const qty = Number(it.quantity ?? 0)
                        const isLow = qty > 0 && qty <= 5

                        return (
                          <tr key={it.id} className={isLow ? 'isLow' : ''}>
                            <td className="mono">{it.id}</td>
                            <td>
                              {isEditing ? (
                                <input
                                  className="input"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                                />
                              ) : (
                                <div className="adminNameCell">{it.name}</div>
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  className="input"
                                  value={editForm.category}
                                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                                />
                              ) : (
                                it.category || '—'
                              )}
                            </td>
                            <td className="num">
                              {isEditing ? (
                                <input
                                  className="input"
                                  value={editForm.image_url}
                                  onChange={(e) => setEditForm((p) => ({ ...p, image_url: e.target.value }))}
                                  placeholder="Image URL"
                                />
                              ) : (
                                it.image_url ? 'Yes' : '—'
                              )}
                            </td>
                            <td className="num">
                              {isEditing ? (
                                <input
                                  className="input"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                                  inputMode="decimal"
                                />
                              ) : (
                                `₹${Number(it.price ?? 0).toFixed(0)}`
                              )}
                            </td>
                            <td className="num">
                              {isEditing ? (
                                <input
                                  className="input"
                                  value={editForm.quantity}
                                  onChange={(e) => setEditForm((p) => ({ ...p, quantity: e.target.value }))}
                                  inputMode="numeric"
                                />
                              ) : (
                                qty
                              )}
                            </td>
                            <td className="num">
                              {isEditing ? (
                                <div className="adminRowActions">
                                  <button className="btn" type="button" onClick={updateSweet} disabled={saving}>
                                    {saving ? 'Please wait…' : 'Save'}
                                  </button>
                                  <button
                                    className="btn secondary"
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={saving}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="adminRowActions">
                                  <button className="btn" type="button" onClick={() => startEdit(it)} disabled={saving}>
                                    Edit
                                  </button>
                                  <button
                                    className="btn secondary"
                                    type="button"
                                    onClick={() => {
                                      const ok = window.confirm('Delete this sweet?')
                                      if (ok) deleteSweet(it.id)
                                    }}
                                    disabled={saving}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
