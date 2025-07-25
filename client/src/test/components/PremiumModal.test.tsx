import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import PremiumModal from '@/components/ui/premium-modal'

describe('PremiumModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onUpgrade: vi.fn(),
  }

  it('renders premium features correctly', () => {
    render(<PremiumModal {...mockProps} />)
    
    expect(screen.getByText('ปลดล็อค LoveMatch Premium')).toBeInTheDocument()
    expect(screen.getByText('Super Likes ไม่จำกัด')).toBeInTheDocument()
    expect(screen.getByText('ดูคนที่ไลค์คุณ')).toBeInTheDocument()
    expect(screen.getByText('ข้อความอ่านแล้ว')).toBeInTheDocument()
  })

  it('allows plan selection', () => {
    render(<PremiumModal {...mockProps} />)
    
    const yearlyButton = screen.getByText('รายปี')
    fireEvent.click(yearlyButton)
    
    expect(screen.getByText('฿2,999')).toBeInTheDocument()
    expect(screen.getByText('ประหยัด 17%')).toBeInTheDocument()
  })

  it('calls onUpgrade when upgrade button is clicked', () => {
    render(<PremiumModal {...mockProps} />)
    
    const upgradeButton = screen.getByTestId('upgrade-premium')
    fireEvent.click(upgradeButton)
    
    expect(mockProps.onUpgrade).toHaveBeenCalled()
  })

  it('calls onClose when close button is clicked', () => {
    render(<PremiumModal {...mockProps} />)
    
    const closeButton = screen.getByTestId('close-premium-modal')
    fireEvent.click(closeButton)
    
    expect(mockProps.onClose).toHaveBeenCalled()
  })

  it('does not render when isOpen is false', () => {
    render(<PremiumModal {...mockProps} isOpen={false} />)
    
    expect(screen.queryByText('ปลดล็อค LoveMatch Premium')).not.toBeInTheDocument()
  })
})