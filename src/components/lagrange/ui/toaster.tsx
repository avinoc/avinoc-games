import { Toast, ToastViewport, ToastTitle, ToastDescription, ToastClose } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="text-cyan-300">{title}</ToastTitle>
              )}
              {description && (
                <ToastDescription className="text-gray-300">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-cyan-400 hover:text-cyan-300" />
          </Toast>
        );
      })}
      <ToastViewport />
    </div>
  );
}