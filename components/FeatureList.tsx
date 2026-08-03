type Item = {
  title: string;
  body: string;
  code?: string;
};

export function FeatureList({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-x-10 gap-y-0 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.title} className="panel">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="panel-title text-[1.15rem]">{item.title}</h3>
            {item.code ? <span className="meta">{item.code}</span> : null}
          </div>
          <p className="panel-body">{item.body}</p>
        </article>
      ))}
    </div>
  );
}
