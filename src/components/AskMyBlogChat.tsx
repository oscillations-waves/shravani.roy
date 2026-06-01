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
    } catch (err) {
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
    <div class="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      {/* Message list */}
      <div class="flex flex-col gap-4 min-h-[200px]">
        <Show when={messages().length === 0}>
          <div class="text-center text-zinc-400 dark:text-zinc-500 py-12 text-sm">
            Ask anything about the blog — topics, posts, ideas.
          </div>
        </Show>

        <For each={messages()}>
          {(msg) => (
            <div
              class={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                class={`rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-zinc-800 dark:bg-zinc-700 text-white rounded-br-sm'
                    : msg.error
                      ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-bl-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-sm'
                }`}
              >
                <Show when={msg.role === 'user'}>
                  <p>{msg.content}</p>
                </Show>

                <Show when={msg.role === 'assistant'}>
                  <Show
                    when={msg.content}
                    fallback={
                      <span class="animate-pulse text-zinc-400">Thinking…</span>
                    }
                  >
                    {/* eslint-disable-next-line solid/no-innerhtml */}
                    <div
                      class="prose prose-sm dark:prose-invert max-w-none"
                      innerHTML={marked.parse(msg.content) as string}
                    />
                  </Show>

                  <Show when={(msg.sources?.length ?? 0) > 0}>
                    <div class="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap gap-2">
                      <For each={msg.sources}>
                        {(slug) => (
                          <a
                            href={`${BLOG_BASE}${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
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

      {/* Input form */}
      <form
        onSubmit={submit}
        class="flex gap-2 sticky bottom-0 bg-white dark:bg-zinc-900 pt-2"
      >
        <input
          type="text"
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          placeholder='e.g. "What did you write about Ruby variables?"'
          disabled={loading()}
          class="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading() || !input().trim()}
          class="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 transition-colors"
        >
          {loading() ? '…' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
