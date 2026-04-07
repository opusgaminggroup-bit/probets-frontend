'use client';

import { ChevronDown, ChevronRight, Coins, Users } from 'lucide-react';
import { money } from '@/lib/format';
import type { AgentTreeNode } from '@/types/agents-tree';

export function TreeNode({
  node,
  level,
  expanded,
  selectedId,
  toggle,
  select,
  canManage,
}: {
  node: AgentTreeNode;
  level: number;
  expanded: Set<string>;
  selectedId?: string;
  toggle: (id: string) => void;
  select: (node: AgentTreeNode) => void;
  canManage: (node: AgentTreeNode) => boolean;
}) {
  const isOpen = expanded.has(node.id);
  const hasChildren = !!node.children?.length;
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={`group rounded-xl border px-3 py-2 mb-2 transition-all ${isSelected ? 'border-[#FFD700]/60 bg-[#FFD700]/10' : 'border-white/10 bg-white/5 hover:border-[#FFD700]/30'}`}
        style={{ marginLeft: level * 14 }}
      >
        <div className="flex items-center gap-2">
          <button
            className="h-6 w-6 grid place-items-center rounded hover:bg-white/10"
            onClick={() => hasChildren && toggle(node.id)}
          >
            {hasChildren ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="text-zinc-600">•</span>}
          </button>
          <button className="flex-1 text-left" onClick={() => select(node)}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-medium">{node.username} <span className="text-xs uppercase text-zinc-400">{node.role}</span></div>
                <div className="text-xs text-zinc-500">ID: {node.id}</div>
              </div>
              <div className="text-right">
                <div className="text-[#FFD700] text-sm font-semibold inline-flex items-center gap-1"><Coins size={12} />{money(Number(node.creditBalance || 0))}</div>
                <div className="text-[11px] text-zinc-500 inline-flex items-center gap-1"><Users size={11} />{node.childrenCount ?? node.children?.length ?? 0} 下级</div>
              </div>
            </div>
          </button>
        </div>
        {!canManage(node) ? <div className="mt-2 text-[11px] text-amber-300">SuperAgent 范围外（仅可查看直属分支）</div> : null}
      </div>

      {hasChildren && isOpen ? (
        <div className="transition-all duration-200">
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              selectedId={selectedId}
              toggle={toggle}
              select={select}
              canManage={canManage}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
