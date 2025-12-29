function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const imageExt = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i;
  if (imageExt.test(url)) return true;
  if (url.startsWith('/uploads') || url.includes('s3.amazonaws.com')) return true;
  return false;
}

export default function ChatMessage({ message, isDoctor }) {
  const maybeImage = isImageUrl(message.text) || (message.file && message.file.url) || (message.fileUrl && isImageUrl(message.fileUrl));
  const imageUrl = message.file?.url || message.fileUrl || (maybeImage && message.text);

  return (
    <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs px-4 py-2 rounded-xl shadow ${isDoctor ? 'bg-yellow-100 text-yellow-800' : 'bg-zinc-100 text-zinc-700'}`}>
        {imageUrl ? (
          <img src={imageUrl} alt="attachment" className="max-w-full h-auto rounded" />
        ) : (
          message.text
        )}
        <div className="text-xs text-zinc-400 mt-1">{message.time}</div>
      </div>
    </div>
  );
}
