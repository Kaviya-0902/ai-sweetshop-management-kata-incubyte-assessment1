import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App.jsx'

describe('Sweet Shop (beginner tests)', () => {
  test('renders the page title', () => {
    render(<App />)
    expect(screen.getByText('Sweet Shop')).toBeInTheDocument()
  })

  test('clicking Add to cart increases cart count', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.getByText(/Cart:\s*0/i)).toBeInTheDocument()

    const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
    const firstEnabled = addButtons.find((b) => !b.disabled)
    expect(firstEnabled).toBeTruthy()

    await user.click(firstEnabled)

    expect(screen.getByText(/Cart:\s*1/i)).toBeInTheDocument()
  })
})
