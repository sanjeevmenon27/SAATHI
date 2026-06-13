export const MobileDataList = ({ items, renderItem, headers, renderRow, emptyMessage }) => (
  <>
    <div className="space-y-4 md:hidden">
      {items.length ? items.map(renderItem) : <p className="text-cocoa-700">{emptyMessage}</p>}
    </div>
    <div className="hidden md:block">
      {items.length ? (
        <div className="overflow-hidden rounded-[28px] ring-1 ring-saffron-100">
          <table className="min-w-full bg-white text-left">
            <thead className="bg-cream-50">
              <tr className="text-cocoa-700">
                {headers.map((heading) => (
                  <th key={heading} className="px-4 py-3 text-sm font-semibold uppercase tracking-wide">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>{items.map(renderRow)}</tbody>
          </table>
        </div>
      ) : (
        <p className="text-cocoa-700">{emptyMessage}</p>
      )}
    </div>
  </>
);
