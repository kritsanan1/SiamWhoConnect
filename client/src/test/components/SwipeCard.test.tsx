import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SwipeCard from '@/components/ui/swipe-card'
import type { User } from '@shared/schema'

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  profileImageUrl: 'https://example.com/image.jpg',
  displayName: 'John Doe',
  age: 25,
  gender: 'male',
  location: 'กรุงเทพมหานคร',
  bio: 'Test bio',
  occupation: 'Developer',
  education: 'Computer Science',
  interests: ['เพลงป็อป', 'ถ่ายรูป'],
  videoUrl: 'https://example.com/video.mp4',
  isProfileComplete: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('SwipeCard', () => {
  it('renders user information correctly', () => {
    render(<SwipeCard user={mockUser} isActive={true} />)
    
    expect(screen.getByTestId(`text-user-name-${mockUser.id}`)).toHaveTextContent('John Doe, 25')
    expect(screen.getByText('Developer • กรุงเทพมหานคร')).toBeInTheDocument()
    expect(screen.getByText('🎓 Computer Science')).toBeInTheDocument()
  })

  it('displays interests tags', () => {
    render(<SwipeCard user={mockUser} isActive={true} />)
    
    expect(screen.getByTestId(`interest-เพลงป็อป-${mockUser.id}`)).toHaveTextContent('เพลงป็อป')
    expect(screen.getByTestId(`interest-ถ่ายรูป-${mockUser.id}`)).toHaveTextContent('ถ่ายรูป')
  })

  it('shows video play button when video URL is present', () => {
    render(<SwipeCard user={mockUser} isActive={true} />)
    
    expect(screen.getByTestId(`button-play-video-${mockUser.id}`)).toBeInTheDocument()
  })

  it('calls onSwipeAction when swiped', () => {
    const mockOnSwipeAction = vi.fn()
    render(<SwipeCard user={mockUser} isActive={true} onSwipeAction={mockOnSwipeAction} />)
    
    const card = screen.getByTestId(`swipe-card-${mockUser.id}`)
    
    // Simulate swipe right
    fireEvent.mouseDown(card, { clientX: 0, clientY: 0 })
    fireEvent.mouseMove(card, { clientX: 150, clientY: 0 })
    fireEvent.mouseUp(card)
    
    expect(mockOnSwipeAction).toHaveBeenCalledWith('like')
  })

  it('shows like indicator on right swipe', () => {
    render(<SwipeCard user={mockUser} isActive={true} />)
    
    const card = screen.getByTestId(`swipe-card-${mockUser.id}`)
    
    fireEvent.mouseDown(card, { clientX: 0, clientY: 0 })
    fireEvent.mouseMove(card, { clientX: 60, clientY: 0 })
    
    expect(screen.getByText('ชอบ')).toBeInTheDocument()
  })
})