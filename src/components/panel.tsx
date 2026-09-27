/* Bracketed HUD frame: title strip, optional right-hand meta readout, and the
   four corner ticks that make a panel read as an instrument, not a card. */
export function Panel(props: {
  title: string;
  meta?: string;
  class?: string;
  row?: number;
  col?: number;
  children?: any;
}) {
  return (
    <gridlayout class={`panel ${props.class ?? ''}`} rows="auto, *" row={props.row ?? 0} col={props.col ?? 0}>
      <gridlayout row={0} class="panel-head" columns="*, auto">
        <label col={0} class="panel-title" text={props.title} />
        <label col={1} class="panel-meta" text={props.meta ?? ''} />
      </gridlayout>
      <gridlayout row={1}>{props.children}</gridlayout>
      <gridlayout rowSpan={2} class="corner corner-tl" horizontalAlignment="left" verticalAlignment="top" />
      <gridlayout rowSpan={2} class="corner corner-tr" horizontalAlignment="right" verticalAlignment="top" />
      <gridlayout rowSpan={2} class="corner corner-bl" horizontalAlignment="left" verticalAlignment="bottom" />
      <gridlayout rowSpan={2} class="corner corner-br" horizontalAlignment="right" verticalAlignment="bottom" />
    </gridlayout>
  );
}
