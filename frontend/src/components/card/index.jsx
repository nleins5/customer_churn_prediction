function Card(props) {
  const { variant, extra, children, ...rest } = props;
  return (
    <div
      className={`!z-5 relative flex flex-col rounded-2xl border border-[#2E4036]/10 dark:border-white/5 backdrop-blur-md bg-white/60 dark:bg-[#0d0d12]/45 ${extra}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
