import { Icon } from './Icon'

export function Avatar({
  size = 'md',
  src,
  name,
}: {
  size?: 'sm' | 'md'
  src?: string
  name?: string
}) {
  return (
    <div className={`avatar avatar-${size}`}>
      {src && (
        <img
          className="avatar-image"
          src={src}
          alt={name || ''}
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      )}
      <Icon name="user" size={16} />
    </div>
  )
}
