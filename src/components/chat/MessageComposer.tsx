import type { FormEvent } from 'react'
import { MAX_MESSAGE_LENGTH } from '../../constants'
import { Icon } from '../common/Icon'
import { SettingsField } from '../common/SettingsField'
import { IconButton } from '../common/IconButton'

type MessageComposerProps = {
  draft: string
  isSending: boolean
  onDraftChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function MessageComposer({
  draft,
  isSending,
  onDraftChange,
  onSubmit,
}: MessageComposerProps) {
  return (
    <form className="message-composer" onSubmit={onSubmit}>
      <IconButton className="size-10" icon="paperclip" label="Прикрепить файл" />
      <div className="composer-input-wrap">
        <SettingsField
          value={draft}
          onChange={onDraftChange}
          placeholder="Напишите сообщение…"
          inputMode="url"
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <IconButton className="composer-action" icon="smile" label="Добавить эмодзи" />
      </div>
      <button className="send-button" type="submit" disabled={isSending || !draft.trim()} aria-label="Отправить">
        <Icon name="send" />
      </button>
    </form>
  )
}
