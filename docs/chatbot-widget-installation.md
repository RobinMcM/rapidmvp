# Chatbot Widget Installation (3-Section Pattern)

This guide defines the standard installation pattern for client websites, including `movieshaker.com`.

The page should include three sections:

1. Hidden rules field
2. Chatbot widget mount
3. Result field (receives the latest assistant response)

## 1) Hidden rules field

Add a hidden textarea (or input) that contains the active rules text.

```html
<textarea id="chatbot-hidden-rules" hidden>
You are a helpful assistant for MovieShaker.
Keep responses concise and practical for film production teams.
</textarea>
```

## 2) Widget embed

Add the widget script and custom element. Use `rules_source=hidden` to instruct chatbot API to use hidden rules text from the page bridge.

```html
<script src="https://chatbot.openrouter.io/chatbot-widget/usageflows-chatbot.js" defer></script>

<usageflows-chatbot
  embed-src="https://chatbot.openrouter.io/chatbot/embed?rule=insolvency&rules_source=hidden&model=openai/gpt-5-mini&bg=%23250411"
  hidden-rules-field-id="chatbot-hidden-rules"
  result-field-id="chatbot-result"
  embedded="false"
></usageflows-chatbot>
```

### Attribute reference

- `embed-src`: full chatbot URL with config.
- `hidden-rules-field-id`: id of hidden field to read rules text from.
- `hidden-rules-selector`: optional CSS selector alternative to `hidden-rules-field-id`.
- `result-field-id`: id of target field receiving latest assistant result text.
- `result-field-selector`: optional CSS selector alternative to `result-field-id`.

## 3) Result field

Add a visible field that receives the latest assistant response after each reply.

```html
<label for="chatbot-result">Latest chatbot result</label>
<textarea id="chatbot-result" rows="8" placeholder="Chatbot result will appear here"></textarea>
```

## Copy one chat result from widget UI

Each assistant message now includes a `Copy` button in the widget. Clicking it copies that single result to clipboard.

## Rules source behavior

- `rules_source=folder`: server loads `rules/<rule>.md` (with default fallback).
- `rules_source=hidden`: server uses `hidden_rules_text` from the page bridge when provided.
- If `rules_source=hidden` is set but no hidden text is available, chatbot safely falls back to default server rules template.

## MovieShaker starter snippet

```html
<textarea id="chatbot-hidden-rules" hidden>
You are the MovieShaker assistant.
Focus on production planning, scheduling, and practical next steps.
</textarea>

<label for="chatbot-result">Latest chatbot result</label>
<textarea id="chatbot-result" rows="8"></textarea>

<script src="https://chatbot.openrouter.io/chatbot-widget/usageflows-chatbot.js" defer></script>
<usageflows-chatbot
  embed-src="https://chatbot.openrouter.io/chatbot/embed?rule=insolvency&rules_source=hidden&model=openai/gpt-5-mini&bg=%23250411"
  hidden-rules-field-id="chatbot-hidden-rules"
  result-field-id="chatbot-result"
  embedded="false"
></usageflows-chatbot>
```
