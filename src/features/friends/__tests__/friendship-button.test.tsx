// src/features/friends/__tests__/friendship-button.test.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FriendshipButton } from "../components/friendship-button";

// Мокаем хуки — тестируем UI-логику кнопки, не сеть
vi.mock("../hooks", () => ({
  useSendFriendRequest: () => ({ mutate: vi.fn(), isPending: false }),
  useAcceptFriendRequest: () => ({ mutate: vi.fn(), isPending: false }),
  useDeclineFriendRequest: () => ({ mutate: vi.fn(), isPending: false }),
  useCancelFriendRequest: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveFriend: () => ({ mutate: vi.fn(), isPending: false }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe("FriendshipButton", () => {
  it("status=self → ничего не рендерит", () => {
    const { container } = render(
      <FriendshipButton userId={1} status="self" friendshipId={null} />,
      { wrapper },
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("status=none → показывает 'Добавить в друзья'", () => {
    render(
      <FriendshipButton userId={1} status="none" friendshipId={null} />,
      { wrapper },
    );
    expect(screen.getByText(/добавить в друзья/i)).toBeInTheDocument();
  });

  it("status=pending_outgoing → показывает 'Отменить заявку'", () => {
    render(
      <FriendshipButton userId={1} status="pending_outgoing" friendshipId={42} />,
      { wrapper },
    );
    expect(screen.getByText(/отменить заявку/i)).toBeInTheDocument();
  });

  it("status=pending_incoming → показывает 'Принять' и 'Отклонить'", () => {
    render(
      <FriendshipButton userId={1} status="pending_incoming" friendshipId={42} />,
      { wrapper },
    );
    expect(screen.getByText(/принять/i)).toBeInTheDocument();
    expect(screen.getByText(/отклонить/i)).toBeInTheDocument();
  });

  it("status=friends → подтверждение перед удалением", async () => {
    const user = userEvent.setup();
    render(
      <FriendshipButton userId={1} status="friends" friendshipId={42} />,
      { wrapper },
    );

    await user.click(screen.getByText(/удалить из друзей/i));
    expect(
      screen.getByRole("alertdialog", { name: /удалить из друзей/i }),
    ).toBeInTheDocument();
  });
});