import React, { useState, useMemo } from 'react';
import { MdSearch, MdPlace, MdFolderOpen, MdGavel, MdWarning } from 'react-icons/md';

const TYPE_CONFIG = {
  Project:   { icon: MdFolderOpen, color: 'text-blue-600',  bg: 'bg-blue-50',   label: 'bg-blue-100 text-blue-700' },
  Decision:  { icon: MdGavel,      color: 'text-green-600', bg: 'bg-green-50',  label: 'bg-green-100 text-green-700' },
  Asset:     { icon: MdWarning,    color: 'text-red-600',   bg: 'bg-red-50',    label: 'bg-red-100 text-red-700' },
  Chainage:  { icon: MdPlace,      color: 'text-purple-600',bg: 'bg-purple-50', label: 'bg-purple-100 text-purple-700' },
};

const KnowledgeCenter = ({ data }) => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  if (!data) return <div className="p-6 text-center text-sm text-gray-400">Knowledge base unavailable.</div>;

  const allItems = [
    ...(data.projects || []),
    ...(data.decisions || []),
    ...(data.criticalAssets || []),
    ...(data.criticalChainages || []),
  ];

  const filtered = useMemo(() => {
    let items = allItems;
    if (typeFilter !== 'All') items = items.filter(i => i.type === typeFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(i => i.title?.toLowerCase().includes(q) || i.project?.toLowerCase().includes(q) || i.code?.toLowerCase().includes(q));
    }
    return items.slice(0, 30);
  }, [query, typeFilter, data]);

  const types = ['All', 'Project', 'Decision', 'Asset', 'Chainage'];

  return (
    <div className="flex flex-col h-[550px]">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
        <MdSearch className="text-xl text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search projects, decisions, assets, chainages..."
          className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full text-gray-800 placeholder-gray-400"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-xs text-gray-400 hover:text-gray-600 font-bold shrink-0">Clear</button>
        )}
      </div>

      {/* Type filters */}
      <div className="flex gap-2 px-4 py-3 border-b border-gray-100 overflow-x-auto bg-white">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${
              typeFilter === t ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">No results found.</div>
        ) : (
          filtered.map((item, i) => {
            const conf = TYPE_CONFIG[item.type] || TYPE_CONFIG.Project;
            const Icon = conf.icon;
            return (
              <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${conf.bg} shrink-0`}>
                  <Icon className={`text-base ${conf.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm truncate">{item.title}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${conf.label}`}>{item.type}</span>
                    {item.priority && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{item.priority}</span>
                    )}
                  </div>
                  {(item.project || item.count !== undefined || item.code) && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.project && <span>{item.project}</span>}
                      {item.code && <span className="font-mono"> · {item.code}</span>}
                      {item.count !== undefined && <span> · {item.count} critical issue{item.count !== 1 ? 's' : ''}</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-[10px] font-bold text-gray-400">
        {filtered.length} result{filtered.length !== 1 ? 's' : ''} · Knowledge base draws from live inspection records
      </div>
    </div>
  );
};

export default KnowledgeCenter;
