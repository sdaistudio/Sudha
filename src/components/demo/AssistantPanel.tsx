import { useState } from 'react'
import { ASSISTANT_QA } from '../../content/site'
import { SampleBadge, SudhaSays } from '../ui/Bits'
import { TabPanel, Tabs } from '../ui/Tabs'

type Cat = 'Policy' | 'Learning' | 'Product'

export function AssistantPanel() {
  const [cat, setCat] = useState<Cat>('Policy')
  const [qi, setQi] = useState<number | null>(null)
  const list = ASSISTANT_QA.map((x, i) => ({ ...x, i })).filter((x) => x.category === cat)
  const sel = qi !== null ? ASSISTANT_QA[qi] : null
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="display text-2xl text-navy sm:text-3xl">Everyday employee assistant</h3>
        <Tabs
          idBase="assist"
          label="Question type"
          items={(['Policy', 'Learning', 'Product'] as Cat[]).map((c) => ({ id: c, label: c }))}
          value={cat}
          onChange={(c) => {
            setCat(c)
            setQi(null)
          }}
        />
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        <SampleBadge />
        <span>Fictional examples showing the intended answer structure. Not SUD Life policy, product terms or advice.</span>
      </div>
      <TabPanel idBase="assist" id={cat}>
        <div className="grid gap-5 lg:grid-cols-[17rem_1fr]">
          <ul className="space-y-2">
            {list.map((x) => (
              <li key={x.q}>
                <button type="button" aria-pressed={qi === x.i} onClick={() => setQi(x.i)} className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${qi === x.i ? 'border-navy bg-navy text-ivory' : 'border-line bg-paper text-navy hover:border-navy'}`}>
                  {x.q}
                </button>
              </li>
            ))}
          </ul>
          <div aria-live="polite">
            {sel ? (
              <SudhaSays label="Sudha · sample content">
                <div className="space-y-2">
                  {sel.a.map((l) => (
                    <p key={l}>{l}</p>
                  ))}
                </div>
                <p className="mt-3 border-t border-line pt-2 text-xs text-muted">Planned source: approved {sel.category === 'Policy' ? 'HR policy repository / HRMS' : sel.category === 'Learning' ? 'LMS' : 'product repository'}. Nothing is submitted from this demo.</p>
              </SudhaSays>
            ) : (
              <p className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">Choose a question to see how Sudha would structure the answer.</p>
            )}
          </div>
        </div>
      </TabPanel>
    </div>
  )
}
