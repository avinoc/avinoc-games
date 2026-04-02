import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const SonnerToaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          toast:
            "bg-gray-900 border border-cyan-500/30 backdrop-blur-sm text-white",
          description: "text-gray-300",
          actionButton: "bg-cyan-600 text-white hover:bg-cyan-700",
          cancelButton: "bg-gray-800 text-gray-300 hover:bg-gray-700",
        },
      }}
      {...props}
    />
  );
};

export { SonnerToaster as Toaster };