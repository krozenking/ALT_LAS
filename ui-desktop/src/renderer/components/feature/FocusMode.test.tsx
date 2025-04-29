import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import FocusMode from './FocusMode'; // Adjust path as needed

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Chakra UI useToast
const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@chakra-ui/react')>();
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

// Helper to advance time
vi.useFakeTimers();

const FOCUS_STATS_KEY = 'alt_las_focus_stats';

describe('FocusMode Component', () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    localStorageMock.clear();
    mockToast.mockClear();
    // Reset date mock if needed for specific tests
    vi.setSystemTime(new Date('2024-04-29T10:00:00Z'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ChakraProvider>
        <FocusMode />
      </ChakraProvider>
    );
  };

  it('renders the trigger button', () => {
    renderComponent();
    expect(screen.getByLabelText('Odaklanma Modunu Aç/Kapat')).toBeInTheDocument();
  });

  it('opens popover on trigger button click', async () => {
    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);
    expect(screen.getByText('Odaklanma Modunu Ayarla')).toBeInTheDocument();
    expect(screen.getByText(/Çalışma süresini \(dakika\) seçin:/)).toBeInTheDocument();
  });

  it('loads initial stats from empty localStorage', async () => {
    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);
    // Check default stats display
    const statElements = screen.getAllByText('Bugün Tamamlanan Seanslar');
    // Find the one within the settings view (not the active view)
    const settingStat = statElements.find(el => el.closest('.chakra-popover__body')?.querySelector('button[aria-label*="Odaklanmaya Başla"]'));
    expect(settingStat?.nextElementSibling?.textContent).toBe('0');
  });

  it('loads existing stats from localStorage', async () => {
    const initialStats = {
      dailyCompleted: 2,
      weeklyCompleted: 5,
      totalCompleted: 10,
      lastSessionDate: '2024-04-29',
      history: [{ date: '2024-04-29', completed: 2, duration: 50 }]
    };
    localStorageMock.setItem(FOCUS_STATS_KEY, JSON.stringify(initialStats));

    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);

    const statElements = screen.getAllByText('Bugün Tamamlanan Seanslar');
    const settingStat = statElements.find(el => el.closest('.chakra-popover__body')?.querySelector('button[aria-label*="Odaklanmaya Başla"]'));
    expect(settingStat?.nextElementSibling?.textContent).toBe('2');
  });

  it('starts a focus session', async () => {
    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);

    const startButton = screen.getByText(/Odaklanmaya Başla/);
    await userEvent.click(startButton);

    // Popover should close, button icon/label should change
    await waitFor(() => {
        expect(screen.queryByText('Odaklanma Modunu Ayarla')).not.toBeInTheDocument();
    });
    expect(triggerButton.textContent).toBe('🧘‍♀️'); // Work icon
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Odaklanma Başladı!' }));

    // Re-open popover to check active state
    await userEvent.click(triggerButton);
    expect(screen.getByText('Çalışma Aktif')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument(); // Default duration
  });

  it('completes a work session and updates stats', async () => {
    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);

    const startButton = screen.getByText(/Odaklanmaya Başla/);
    await userEvent.click(startButton);

    // Advance time by default work duration (25 mins)
    await act(async () => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    // Check for break notification
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Çalışma Seansı Tamamlandı!' }));

    // Check stats update in localStorage
    const savedStatsRaw = localStorageMock.getItem(FOCUS_STATS_KEY);
    expect(savedStatsRaw).not.toBeNull();
    const savedStats = JSON.parse(savedStatsRaw!); // Add non-null assertion
    expect(savedStats.dailyCompleted).toBe(1);
    expect(savedStats.weeklyCompleted).toBe(1);
    expect(savedStats.totalCompleted).toBe(1);
    expect(savedStats.lastSessionDate).toBe('2024-04-29');
    expect(savedStats.history).toHaveLength(1);
    expect(savedStats.history[0]).toEqual({ date: '2024-04-29', completed: 1, duration: 25 });

    // Check UI state (should be in short break)
    await userEvent.click(triggerButton); // Re-open popover
    expect(screen.getByText('Kısa Mola Aktif')).toBeInTheDocument();
    expect(screen.getByText('05:00')).toBeInTheDocument(); // Default short break
    expect(screen.getByText('Bugün Tamamlanan Seanslar').nextElementSibling?.textContent).toBe('1');
  });

  it('completes a short break and starts next work session', async () => {
    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);
    await userEvent.click(screen.getByText(/Odaklanmaya Başla/));

    // Complete work session
    await act(async () => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    // Complete short break session
    await act(async () => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    // Check for work start notification
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Mola Bitti!' }));

    // Check UI state (should be back in work session)
    await userEvent.click(triggerButton); // Re-open popover
    expect(screen.getByText('Çalışma Aktif')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('triggers long break after 4 sessions', async () => {
    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);
    await userEvent.click(screen.getByText(/Odaklanmaya Başla/));

    // Simulate 4 work sessions + 3 short breaks
    for (let i = 0; i < 4; i++) {
      // Complete work session
      await act(async () => {
        vi.advanceTimersByTime(25 * 60 * 1000);
      });
      if (i < 3) {
        // Complete short break session
        await act(async () => {
          vi.advanceTimersByTime(5 * 60 * 1000);
        });
      }
    }

    // Check stats
    const savedStatsRaw = localStorageMock.getItem(FOCUS_STATS_KEY);
    const savedStats = JSON.parse(savedStatsRaw!); // Add non-null assertion
    expect(savedStats.dailyCompleted).toBe(4);

    // Check UI state (should be in long break)
    await userEvent.click(triggerButton); // Re-open popover
    expect(screen.getByText('Uzun Mola Aktif')).toBeInTheDocument();
    expect(screen.getByText('15:00')).toBeInTheDocument(); // Default long break
  });

  it('stops the focus session', async () => {
    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);
    await userEvent.click(screen.getByText(/Odaklanmaya Başla/));

    // Advance time partially
    await act(async () => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    // Stop the session
    await userEvent.click(triggerButton); // Re-open popover
    const stopButton = screen.getByText('Odaklanmayı Durdur');
    await userEvent.click(stopButton);

    // Check toast and UI state
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Odaklanma Durduruldu' }));
    expect(triggerButton.textContent).toBe('🧘'); // Idle icon

    // Re-open popover, should be in setup state
    await userEvent.click(triggerButton);
    expect(screen.getByText('Odaklanma Modunu Ayarla')).toBeInTheDocument();
  });

  it('resets daily stats on a new day', async () => {
     const initialStats = {
      dailyCompleted: 3,
      weeklyCompleted: 5,
      totalCompleted: 10,
      lastSessionDate: '2024-04-28', // Previous day
      history: [{ date: '2024-04-28', completed: 3, duration: 75 }]
    };
    localStorageMock.setItem(FOCUS_STATS_KEY, JSON.stringify(initialStats));

    // Set system time to the next day
    vi.setSystemTime(new Date('2024-04-29T08:00:00Z'));

    renderComponent(); // Component loads and useEffect runs

    // Check localStorage directly after load
    const savedStatsRaw = localStorageMock.getItem(FOCUS_STATS_KEY);
    expect(savedStatsRaw).not.toBeNull();
    const savedStats = JSON.parse(savedStatsRaw!); // Add non-null assertion
    expect(savedStats.dailyCompleted).toBe(0); // Should be reset
    expect(savedStats.weeklyCompleted).toBe(5); // Should remain
    expect(savedStats.totalCompleted).toBe(10); // Should remain
    expect(savedStats.lastSessionDate).toBe('2024-04-29'); // Should be updated

    // Check UI
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);
    const statElements = screen.getAllByText('Bugün Tamamlanan Seanslar');
    const settingStat = statElements.find(el => el.closest('.chakra-popover__body')?.querySelector('button[aria-label*="Odaklanmaya Başla"]'));
    expect(settingStat?.nextElementSibling?.textContent).toBe('0');
  });

  it('toggles statistics view', async () => {
    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);

    // Initially shows timer setup
    expect(screen.getByText(/Çalışma süresini \(dakika\) seçin:/)).toBeInTheDocument();

    // Click stats button
    const statsButton = screen.getByRole('button', { name: /İstatistikler/ });
    await userEvent.click(statsButton);

    // Should show stats view
    expect(screen.getByText('Özet')).toBeInTheDocument();
    expect(screen.getByText('Geçmiş')).toBeInTheDocument();
    expect(screen.queryByText(/Çalışma süresini \(dakika\) seçin:/)).not.toBeInTheDocument();

    // Click timer button
    const timerButton = screen.getByRole('button', { name: /Zamanlayıcı/ });
    await userEvent.click(timerButton);

    // Should show timer setup again
    expect(screen.getByText(/Çalışma süresini \(dakika\) seçin:/)).toBeInTheDocument();
    expect(screen.queryByText('Özet')).not.toBeInTheDocument();
  });

  it('resets statistics', async () => {
    const initialStats = {
      dailyCompleted: 2,
      weeklyCompleted: 5,
      totalCompleted: 10,
      lastSessionDate: '2024-04-29',
      history: [{ date: '2024-04-29', completed: 2, duration: 50 }]
    };
    localStorageMock.setItem(FOCUS_STATS_KEY, JSON.stringify(initialStats));

    renderComponent();
    const triggerButton = screen.getByLabelText('Odaklanma Modunu Aç/Kapat');
    await userEvent.click(triggerButton);

    // Go to stats view
    const statsButton = screen.getByRole('button', { name: /İstatistikler/ });
    await userEvent.click(statsButton);

    // Click reset button
    const resetButton = screen.getByRole('button', { name: /İstatistikleri Sıfırla/ });
    await userEvent.click(resetButton);

    // Check toast
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: 'İstatistikler Sıfırlandı' }));

    // Check localStorage
    const savedStatsRaw = localStorageMock.getItem(FOCUS_STATS_KEY);
    const savedStats = JSON.parse(savedStatsRaw!); // Add non-null assertion
    expect(savedStats.dailyCompleted).toBe(0);
    expect(savedStats.weeklyCompleted).toBe(0);
    expect(savedStats.totalCompleted).toBe(0);
    expect(savedStats.history).toHaveLength(0);
    expect(savedStats.lastSessionDate).toBe('2024-04-29'); // Date should remain today

    // Check UI
    expect(screen.getByText('Bugün').nextElementSibling?.textContent).toBe('0');
    expect(screen.getByText('Bu Hafta').nextElementSibling?.textContent).toBe('0');
    expect(screen.getByText('Toplam').nextElementSibling?.textContent).toBe('0');
  });

});

