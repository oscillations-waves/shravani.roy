import { createSignal, For, Show } from 'solid-js';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  error?: boolean;
}

const BLOG_BASE = 'https://oscillations-waves.github.io/shravani.roy/blog/';

interface Props {
  apiUrl?: string;
}

export default function AskMyBlogChat(props: Props) {
  const apiUrl = props.apiUrl ?? 'https://roybonny-askmyblog.hf.space/api/ask';
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [input, setInput] = createSignal('');
  const [loading, setLoading] = createSignal(false);

  async function submit(e: Event) {
    e.preventDefault();
    const question = input().trim();
    if (!question || loading()) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    // Append empty assistant message that we'll stream into
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', sources: [] },
    ]);

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // Parse SSE frames
        const frames = buf.split('\n\n');
        buf = frames.pop() ?? '';

        for (const frame of frames) {
          const eventLine = frame.match(/^event: (.+)/m);
          const dataLine = frame.match(/^data: (.+)/m);
          if (!eventLine || !dataLine) continue;

          const event = eventLine[1].trim();
          const data = JSON.parse(dataLine[1].trim()) as string | string[];

          if (event === 'message') {
            setMessages((prev) => {
              const msgs = [...prev];
              const last = msgs[msgs.length - 1];
              if (last?.role === 'assistant') {
                msgs[msgs.length - 1] = {
                  ...last,
                  content: last.content + (data as string),
                };
              }
              return msgs;
            });
          } else if (event === 'sources') {
            setMessages((prev) => {
              const msgs = [...prev];
              const last = msgs[msgs.length - 1];
              if (last?.role === 'assistant') {
                msgs[msgs.length - 1] = {
                  ...last,
                  sources: data as string[],
                };
              }
              return msgs;
            });
          } else if (event === 'error') {
            setMessages((prev) => {
              const msgs = [...prev];
              const last = msgs[msgs.length - 1];
              if (last?.role === 'assistant') {
                msgs[msgs.length - 1] = {
                  ...last,
                  content: data as string,
                  error: true,
                };
              }
              return msgs;
            });
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const msgs = [...prev];
        const last = msgs[msgs.length - 1];
        if (last?.role === 'assistant') {
          msgs[msgs.length - 1] = {
            ...last,
            content: 'Something went wrong. Please try again.',
            error: true,
          };
        }
        return msgs;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="flex w-full flex-col gap-4">
      {/* Message list */}
      <Show when={messages().length > 0}>
        <div class="flex flex-col gap-4">
          <For each={messages()}>
            {(msg) => (
              <div
                class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  class={`min-w-0 max-w-full rounded-2xl border px-4 py-3 text-sm leading-relaxed [overflow-wrap:anywhere] sm:max-w-[85%] ${
                    msg.role === 'user'
                      ? 'rounded-br-sm border-[color:var(--site-rule)] bg-[color:var(--site-wash)] text-[color:var(--site-ink)]'
                      : msg.error
                        ? 'rounded-bl-sm border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'rounded-bl-sm border-[color:var(--site-rule)] bg-[color:var(--site-surface)] text-[color:var(--site-ink)]'
                  }`}
                >
                  <Show when={msg.role === 'user'}>
                    <p>{msg.content}</p>
                  </Show>

                  <Show when={msg.role === 'assistant'}>
                    <Show
                      when={msg.content}
                      fallback={
                        <span class="text-[color:var(--site-muted)] motion-safe:animate-pulse">Thinking…</span>
                      }
                    >
                      <div
                        class={`prose prose-sm max-w-none ${msg.error ? 'text-inherit' : 'site-prose'}`}
                        innerHTML={marked.parse(msg.content) as string}
                      />
                    </Show>

                    <Show when={(msg.sources?.length ?? 0) > 0}>
                      <div class="mt-3 flex flex-wrap gap-2 border-t border-[color:var(--site-rule)] pt-3">
                        <For each={msg.sources}>
                          {(slug) => (
                            <a
                              href={`${BLOG_BASE}${slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="max-w-full rounded-full border border-[color:var(--site-control)] px-2.5 py-1 text-xs text-[color:var(--site-accent)] transition-colors hover:bg-[color:var(--site-wash)]"
                            >
                              📄 {slug}
                            </a>
                          )}
                        </For>
                      </div>
                    </Show>
                  </Show>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      {/* Input form */}
      <form
        onSubmit={submit}
        class="sticky bottom-0 bg-[color:var(--site-paper)] py-2"
      >
        <div class="flex items-center gap-3 rounded-2xl border border-[color:var(--site-control)] bg-[color:var(--site-surface)] p-2 pl-4 transition-colors focus-within:border-[color:var(--site-accent)] focus-within:ring-1 focus-within:ring-[color:var(--site-accent)]">
          <input
            type="text"
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            aria-label="Question about the blog"
            placeholder="Ask a question…"
            disabled={loading()}
            class="min-w-0 flex-1 bg-transparent text-base text-[color:var(--site-ink)] placeholder-[color:var(--site-muted)] outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading() || !input().trim()}
            class="min-h-11 shrink-0 rounded-xl bg-[color:var(--site-accent)] px-5 text-sm font-bold text-[color:var(--site-paper)] transition-opacity enabled:hover:opacity-85 disabled:opacity-40"
          >
            {loading() ? '…' : 'Ask'}
          </button>
        </div>
      </form>
    </div>
  );
}
