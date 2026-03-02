/**
 * Tests for ManualLocationInput component
 * 
 * Requirements: 1.3, 1.4
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ManualLocationInput, isValidLatitude, isValidLongitude } from './ManualLocationInput';

describe('ManualLocationInput', () => {
  describe('Component Rendering', () => {
    it('should render the form with all required elements', () => {
      const mockSubmit = vi.fn();
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      expect(screen.getByText('Enter Your Location')).toBeInTheDocument();
      expect(screen.getByLabelText('Latitude coordinate')).toBeInTheDocument();
      expect(screen.getByLabelText('Longitude coordinate')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit location' })).toBeInTheDocument();
    });

    it('should display initial values when provided', () => {
      const mockSubmit = vi.fn();
      render(
        <ManualLocationInput
          onLocationSubmit={mockSubmit}
          initialLatitude={40.7128}
          initialLongitude={-74.0060}
        />
      );

      const latInput = screen.getByLabelText('Latitude coordinate') as HTMLInputElement;
      const lonInput = screen.getByLabelText('Longitude coordinate') as HTMLInputElement;

      expect(latInput.value).toBe('40.7128');
      expect(lonInput.value).toBe('-74.006');
    });
  });

  describe('Valid Input Submission', () => {
    it('should submit valid coordinates', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.type(latInput, '40.7128');
      await user.clear(lonInput);
      await user.type(lonInput, '-74.0060');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 0,
        });
      });
    });

    it('should accept boundary values for latitude', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      // Test maximum latitude (90)
      await user.clear(latInput);
      await user.type(latInput, '90');
      await user.clear(lonInput);
      await user.type(lonInput, '0');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          latitude: 90,
          longitude: 0,
          accuracy: 0,
        });
      });

      mockSubmit.mockClear();

      // Test minimum latitude (-90)
      await user.clear(latInput);
      await user.type(latInput, '-90');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          latitude: -90,
          longitude: 0,
          accuracy: 0,
        });
      });
    });

    it('should accept boundary values for longitude', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      // Test maximum longitude (180)
      await user.clear(latInput);
      await user.type(latInput, '0');
      await user.clear(lonInput);
      await user.type(lonInput, '180');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          latitude: 0,
          longitude: 180,
          accuracy: 0,
        });
      });

      mockSubmit.mockClear();

      // Test minimum longitude (-180)
      await user.clear(lonInput);
      await user.type(lonInput, '-180');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          latitude: 0,
          longitude: -180,
          accuracy: 0,
        });
      });
    });
  });

  describe('Validation - Latitude', () => {
    it('should show error for empty latitude', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.clear(lonInput);
      await user.type(lonInput, '0');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Latitude is required')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('should show error for non-numeric latitude', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.type(latInput, 'abc');
      await user.clear(lonInput);
      await user.type(lonInput, '0');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Latitude must be a valid number')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('should show error for latitude above 90', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.type(latInput, '91');
      await user.clear(lonInput);
      await user.type(lonInput, '0');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Latitude must be between -90 and 90')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('should show error for latitude below -90', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.type(latInput, '-91');
      await user.clear(lonInput);
      await user.type(lonInput, '0');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Latitude must be between -90 and 90')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Validation - Longitude', () => {
    it('should show error for empty longitude', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.type(latInput, '0');
      await user.clear(lonInput);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Longitude is required')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('should show error for non-numeric longitude', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.type(latInput, '0');
      await user.clear(lonInput);
      await user.type(lonInput, 'xyz');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Longitude must be a valid number')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('should show error for longitude above 180', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.type(latInput, '0');
      await user.clear(lonInput);
      await user.type(lonInput, '181');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Longitude must be between -180 and 180')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('should show error for longitude below -180', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.type(latInput, '0');
      await user.clear(lonInput);
      await user.type(lonInput, '-181');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Longitude must be between -180 and 180')).toBeInTheDocument();
      });
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Error Clearing', () => {
    it('should clear latitude error when user starts typing', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      // Trigger error
      await user.clear(latInput);
      await user.clear(lonInput);
      await user.type(lonInput, '0');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Latitude is required')).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(latInput, '4');

      await waitFor(() => {
        expect(screen.queryByText('Latitude is required')).not.toBeInTheDocument();
      });
    });

    it('should clear longitude error when user starts typing', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      // Trigger error
      await user.clear(latInput);
      await user.type(latInput, '0');
      await user.clear(lonInput);
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Longitude is required')).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(lonInput, '-');

      await waitFor(() => {
        expect(screen.queryByText('Longitude is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mockSubmit = vi.fn();
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      expect(latInput).toHaveAttribute('aria-label', 'Latitude coordinate');
      expect(lonInput).toHaveAttribute('aria-label', 'Longitude coordinate');
      expect(submitButton).toBeInTheDocument();
    });

    it('should set aria-invalid when there are errors', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const lonInput = screen.getByLabelText('Longitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.clear(lonInput);
      await user.click(submitButton);

      await waitFor(() => {
        expect(latInput).toHaveAttribute('aria-invalid', 'true');
        expect(lonInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should associate error messages with inputs via aria-describedby', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      
      render(<ManualLocationInput onLocationSubmit={mockSubmit} />);

      const latInput = screen.getByLabelText('Latitude coordinate');
      const submitButton = screen.getByRole('button', { name: 'Submit location' });

      await user.clear(latInput);
      await user.click(submitButton);

      await waitFor(() => {
        expect(latInput).toHaveAttribute('aria-describedby', 'latitude-error');
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});

describe('Validation Helper Functions', () => {
  describe('isValidLatitude', () => {
    it('should accept valid latitudes', () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(45)).toBe(true);
      expect(isValidLatitude(-45)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
      expect(isValidLatitude(40.7128)).toBe(true);
    });

    it('should reject invalid latitudes', () => {
      expect(isValidLatitude(91)).toBe(false);
      expect(isValidLatitude(-91)).toBe(false);
      expect(isValidLatitude(180)).toBe(false);
      expect(isValidLatitude(NaN)).toBe(false);
    });
  });

  describe('isValidLongitude', () => {
    it('should accept valid longitudes', () => {
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(90)).toBe(true);
      expect(isValidLongitude(-90)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
      expect(isValidLongitude(-74.0060)).toBe(true);
    });

    it('should reject invalid longitudes', () => {
      expect(isValidLongitude(181)).toBe(false);
      expect(isValidLongitude(-181)).toBe(false);
      expect(isValidLongitude(360)).toBe(false);
      expect(isValidLongitude(NaN)).toBe(false);
    });
  });
});
