type Props = {
  kicker: string;
  title: string;
  lead: string;
};

export function PageHeader({ kicker, title, lead }: Props) {
  return (
    <header className="mb-12 max-w-2xl">
      <p className="panel-label !mb-3">{kicker}</p>
      <h1 className="display text-[clamp(2.4rem,5vw,3.4rem)]">{title}</h1>
      <p className="lede mt-5">{lead}</p>
    </header>
  );
}
