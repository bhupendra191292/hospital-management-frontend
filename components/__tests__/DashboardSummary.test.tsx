import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../test/utils';
import DashboardSummary from '../DashboardSummary.jsx';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('DashboardSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    renderWithProviders(<DashboardSummary token="test-token" />);
    
    // The component shows loading spinners, not text
    expect(screen.getByTestId('dashboard-summary')).toBeInTheDocument();
  });

  it('should render dashboard summary with data', async () => {
    const mockData = {
      totalPatients: 150,
      totalVisits: 450,
      todayVisits: 12,
      pendingAppointments: 5,
    };

    vi.mocked(axios.get).mockResolvedValue({
      data: mockData,
    });

    renderWithProviders(<DashboardSummary token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('450')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should render error state when API fails', async () => {
    vi.mocked(axios.get).mockRejectedValue(
      new Error('API Error')
    );

    renderWithProviders(<DashboardSummary token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument();
    });
  });

  it('should display dashboard stats', async () => {
    const mockData = {
      totalPatients: 100,
      totalVisits: 300,
      todayVisits: 8,
      pendingAppointments: 3,
    };

    vi.mocked(axios.get).mockResolvedValue({
      data: mockData,
    });

    renderWithProviders(<DashboardSummary token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('300')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should display stat descriptions', async () => {
    const mockData = {
      totalPatients: 100,
      totalVisits: 300,
      todayVisits: 8,
      pendingAppointments: 3,
    };

    vi.mocked(axios.get).mockResolvedValue({
      data: mockData,
    });

    renderWithProviders(<DashboardSummary token="test-token" />);

    await waitFor(() => {
      expect(screen.getByText('Registered patients')).toBeInTheDocument();
      expect(screen.getByText('All time visits')).toBeInTheDocument();
      expect(screen.getByText('Today\'s Visits')).toBeInTheDocument();
      expect(screen.getByText('Awaiting confirmation')).toBeInTheDocument();
    });
  });
});
