import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProbabilityBars } from '@/components/ui/ProbabilityBars';

describe('ProbabilityBars', () => {
  it('renders each bar with its percentage', () => {
    render(
      <ProbabilityBars
        bars={[
          { label: '|0⟩', value: 0.5 },
          { label: '|1⟩', value: 0.5 },
        ]}
      />,
    );
    expect(screen.getByText('|0⟩')).toBeInTheDocument();
    expect(screen.getAllByText(/50\.0/).length).toBeGreaterThan(0);
  });
});
