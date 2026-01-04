import { FaUserMd, FaUserInjured, FaComments } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function AdminChatList() {
  const t = useTranslations("adminChat");
  const ui = useTranslations("ui");
  const placeholder = ui("placeholder");

  const chats = t.raw("demoChats");

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      {chats.map((chat) => (
        <div key={chat.id} className="card-glass rounded-2xl border border-(--ui-border) p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2">
            <FaUserMd className="text-(--ui-muted-foreground) text-xl" />
            <span className="font-bold text-(--ui-foreground)">{chat.doctor || placeholder}</span>
            <span className="mx-2 text-(--ui-muted-foreground)">→</span>
            <FaUserInjured className="text-(--ui-muted-foreground) text-xl" />
            <span className="font-bold text-(--ui-foreground)">{chat.patient || placeholder}</span>
          </div>
          <div className="flex items-center gap-2 text-(--ui-foreground)">
            <FaComments className="text-(--ui-muted-foreground)" />
            <span>{chat.lastMsg || placeholder}</span>
            <span className="ml-auto text-xs text-(--ui-muted-foreground)">{chat.time || placeholder}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
