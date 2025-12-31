import Image from 'next/image';

function isImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const imageExt = /\.(png|jpe?g|gif|webp|svg)(\?|$)/i;
  if (imageExt.test(url)) return true;
  if (url.startsWith('/uploads') || url.includes('s3.amazonaws.com')) return true;
  return false;
}

export default function ChatMessage({ message, isDoctor }) {
  const fileUrl = message.fileUrl || message.file?.url || null;
  const mime = message.mimeType || message.file?.type || null;
  const maybeImage = (fileUrl && mime && mime.startsWith('image/')) || isImageUrl(message.text) || (fileUrl && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(fileUrl));
  const imageUrl = fileUrl || (maybeImage && message.text);

  return (
    <div className={`flex ${isDoctor ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs px-4 py-2 rounded-xl shadow ${isDoctor ? 'bg-yellow-100 text-yellow-800' : 'bg-zinc-100 text-zinc-700'}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="attachment"
            width={400}
            height={300}
            className="max-w-full h-auto rounded"
            unoptimized
          />
        ) : (
          message.text
        )}
        <div className="text-xs text-zinc-400 mt-1">{message.time}</div>
      </div>
    </div>
  );
}
