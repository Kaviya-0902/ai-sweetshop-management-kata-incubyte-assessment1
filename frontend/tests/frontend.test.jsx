import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'

describe('Sweet Shop (beginner tests)', () => {
  beforeEach(() => {
    window.localStorage.setItem('token', 'test-token')
    window.localStorage.setItem('role', 'user')
    window.localStorage.setItem('username', 'tester')

    globalThis.fetch = async (url) => {
      if (String(url).includes('/api/sweets')) {
        return {
          ok: true,
          status: 200,
          json: async () => [
            { id: 1, name: 'Jalebi', category: 'Fried', price: 120, quantity: 0 },
            { id: 2, name: 'Gulab Jamun', category: 'Milk', price: 180, quantity: 5 },
          ],
        }
      }
      return { ok: false, status: 404, json: async () => ({ detail: 'Not found' }) }
    }
  })

  test('renders the page title', () => {
    render(<App />)
    expect(screen.getByText('Sweet Shop')).toBeInTheDocument()
  })

  test('purchase button is disabled when quantity is 0', async () => {
    const user = userEvent.setup()
    render(<App />)

    const buttons = await screen.findAllByRole('button', { name: /purchase/i })
    expect(buttons[0]).toBeDisabled()
    expect(buttons[1]).not.toBeDisabled()

    await user.click(buttons[1])
  })
})
