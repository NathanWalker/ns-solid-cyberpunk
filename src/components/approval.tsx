import { createSignal, onCleanup } from 'solid-js';
import { agent, Approval } from '../state/agent';
import { audio } from '../utils/audio';
import { haptics } from '../utils/haptics';

/* The human-in-the-loop gate. The agent proposes, the dial drains, and the
   operator's answer is two large targets away. */
export function ApprovalCard(props: { approval: Approval }) {
  const [left, setLeft] = createSignal(props.approval.ttl);
  const timer = setInterval(() => {
    setLeft((l) => l - 1);
    if (left() <= 0) {
      clearInterval(timer);
      agent.resolveApproval('timeout');
    } else if (left() <= 3) {
      audio.play('tick');
    }
  }, 1000);
  onCleanup(() => clearInterval(timer));

  const decide = (d: 'approve' | 'deny') => {
    clearInterval(timer);
    if (d === 'approve') {
      haptics.success();
      audio.play('approve');
    } else {
      haptics.thud();
      audio.play('deny');
    }
    agent.resolveApproval(d);
  };

  return (
    <gridlayout class="approval" rows="auto, auto, auto, auto">
      <gridlayout row={0} columns="auto, auto, *, auto, 22">
        <label col={0} class="approval-tag" text="⚠ ACTION REQUIRED" verticalAlignment="center" />
        <label col={1} class={`risk risk-${props.approval.risk}`} text={`RISK ${props.approval.risk}`} verticalAlignment="center" />
        <label col={3} class="countdown" text={`${left()}s`} verticalAlignment="center" marginRight={8} />
        <hudarc col={4} seconds={props.approval.ttl} tint="#ff3fa4" thickness={2.5} width={22} height={22} verticalAlignment="center" />
      </gridlayout>
      <label row={1} class="approval-title" text={props.approval.title} textWrap={true} />
      <label row={2} class="approval-detail" text={props.approval.detail} textWrap={true} />
      <gridlayout row={3} columns="*, *">
        <label col={0} class="btn btn-approve" text="✓  APPROVE" on:tap={() => decide('approve')} />
        <label col={1} class="btn btn-deny" text="✕  DENY" on:tap={() => decide('deny')} />
      </gridlayout>
      <gridlayout rowSpan={4} class="corner corner-tl" horizontalAlignment="left" verticalAlignment="top" />
      <gridlayout rowSpan={4} class="corner corner-tr" horizontalAlignment="right" verticalAlignment="top" />
      <gridlayout rowSpan={4} class="corner corner-bl" horizontalAlignment="left" verticalAlignment="bottom" />
      <gridlayout rowSpan={4} class="corner corner-br" horizontalAlignment="right" verticalAlignment="bottom" />
    </gridlayout>
  );
}
