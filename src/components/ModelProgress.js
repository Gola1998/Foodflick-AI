// A small progress bar shown while an AI model downloads for the first time.
// After that the browser keeps the model, so it is instant next time.
// Shows nothing when the model is not downloading.
const ModelProgress = ({ model, what, size }) => {
  if (model.state !== "loading") return null;

  return (
    <div className="mt-3 max-w-md text-left">
      <p className="text-xs text-gray-600">
        ⬇️ Downloading the {what} AI model ({size}, first time only)... {model.percent}%
      </p>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
        <div
          className="h-full bg-orange-500 transition-all duration-300"
          style={{ width: model.percent + "%" }}
        />
      </div>
    </div>
  );
};

export default ModelProgress;
