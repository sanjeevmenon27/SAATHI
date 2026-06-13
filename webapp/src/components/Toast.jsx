export const Toast = ({ message, onClose }) =>
  message ? (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md rounded-2xl bg-cocoa-900 px-4 py-4 text-white shadow-card md:bottom-6 md:right-6 md:left-auto md:mx-0">
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm sm:text-base">{message}</span>
        <button type="button" onClick={onClose} className="shrink-0 text-sm underline">
          Close
        </button>
      </div>
    </div>
  ) : null;
