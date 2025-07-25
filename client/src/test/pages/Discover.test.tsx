import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Discover from '@/pages/discover'

// Mock the hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      displayName: 'Test User',
      age: 25,
    },
    isAuthenticated: true,
  }),
}))

vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(),
}))

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}

describe('Discover Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders discover page header', () => {
    renderWithQueryClient(<Discover />)
    
    expect(screen.getByText('ค้นหาคู่แมตช์')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    renderWithQueryClient(<Discover />)
    
    expect(screen.getByText('กำลังค้นหาคนใหม่...')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    renderWithQueryClient(<Discover />)
    
    expect(screen.getByTestId('button-pass')).toBeInTheDocument()
    expect(screen.getByTestId('button-super-like')).toBeInTheDocument()
    expect(screen.getByTestId('button-like')).toBeInTheDocument()
  })

  it('shows premium modal when super like is clicked without premium', async () => {
    renderWithQueryClient(<Discover />)
    
    const superLikeButton = screen.getByTestId('button-super-like')
    fireEvent.click(superLikeButton)
    
    await waitFor(() => {
      expect(screen.getByText('ปลดล็อค LoveMatch Premium')).toBeInTheDocument()
    })
  })
})