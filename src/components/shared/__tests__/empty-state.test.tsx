// src/components/shared/__tests__/empty-state.test.tsx
import { render, screen } from '@testing-library/react';
import { MapPin } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('рендерит title', () => {
    render(<EmptyState title="Пусто" />);
    expect(screen.getByText('Пусто')).toBeInTheDocument();
  });

  it('рендерит description когда передан', () => {
    render(<EmptyState title="Пусто" description="Добавь друзей" />);
    expect(screen.getByText('Добавь друзей')).toBeInTheDocument();
  });

  it('рендерит action когда передан', () => {
    render(
      <EmptyState
        title="Пусто"
        action={<button type="button">Действие</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Действие' })).toBeInTheDocument();
  });

  it('имеет role=status для screen readers', () => {
    render(<EmptyState title="Пусто" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('иконка скрыта от screen reader', () => {
    const { container } = render(<EmptyState icon={MapPin} title="Пусто" />);
    const icon = container.querySelector('[aria-hidden]');
    expect(icon).toBeTruthy();
  });
});
