const Head = ({title}: {title: string}) => {
  return <>
    <title>{title}</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width"/>
  </>;
};

export { Head };