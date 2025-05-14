import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Modal from './Modal';

describe('Modal Component', () => {
  test('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when clicking outside the modal', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    // Click on the overlay (outside the modal content)
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('does not call onClose when clicking inside the modal', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    // Click inside the modal content
    fireEvent.click(screen.getByText('Modal content'));
    expect(handleClose).not.toHaveBeenCalled();
  });

  test('renders modal with custom size', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={jest.fn()} title="Small Modal" size="sm">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('modal-sm');
    
    rerender(
      <Modal isOpen={true} onClose={jest.fn()} title="Large Modal" size="lg">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('modal-lg');
  });

  test('renders modal with footer', () => {
    render(
      <Modal
        isOpen={true}
        onClose={jest.fn()}
        title="Modal with Footer"
        footer={<button>Save</button>}
      >
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Modal with Footer')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  test('renders modal without close button when closeButton is false', () => {
    render(
      <Modal
        isOpen={true}
        onClose={jest.fn()}
        title="Modal without Close Button"
        closeButton={false}
      >
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  test('renders modal with custom className', () => {
    render(
      <Modal
        isOpen={true}
        onClose={jest.fn()}
        title="Custom Modal"
        className="custom-modal"
      >
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByRole('dialog')).toHaveClass('custom-modal');
  });

  test('renders modal with custom header', () => {
    render(
      <Modal
        isOpen={true}
        onClose={jest.fn()}
        header={<h3>Custom Header</h3>}
      >
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  test('prevents closing when preventClose is true', () => {
    const handleClose = jest.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Prevent Close Modal"
        preventClose={true}
      >
        <p>Modal content</p>
      </Modal>
    );
    
    // Click on the overlay (outside the modal content)
    fireEvent.click(screen.getByTestId('modal-overlay'));
    expect(handleClose).not.toHaveBeenCalled();
    
    // Try to close with escape key
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).not.toHaveBeenCalled();
  });

  test('closes modal with escape key', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    // Press escape key
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
