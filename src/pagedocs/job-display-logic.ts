/*
 * Job display logic — how each display area on the jobseeker site decides which jobs it shows.
 *
 * WHY THIS GROUP EXISTS. Nobody had written down how a placement picks its
 * content. Sales sells "your posting appears in area X" with no statement of
 * what that buys, and the admin Placement load dashboard reports numbers
 * (2.618 "never shown" on Top search) that read as a fault when they are the
 * design. The group answers one question per area, in the same shape every
 * time, so a new area is a new page and nothing else moves.
 *
 * WHO READS THESE PAGES. Thu settled this on 2026-11-21: the per-area pages
 * (/trang/top-search and the ones that follow it) are a USER GUIDE FOR THE
 * CLIENT. They describe the logic of an area and nothing else. They are NOT a
 * requirement for the dev, so none of the following belongs on them:
 *   - "Bản yêu cầu", status lines, ✅ / 🔶 markers, who decided and when
 *   - ticket codes
 *   - gap statements: "hiện tại là 8", "đổi thành 20 nằm trong task",
 *     "khác hiện tại", anything comparing today's build to the target
 *   - production measurements, pool sizes, named employers, config advice
 *   - internal to-do lists for the team
 * That material lives in the spec site and the PM ticket, which is where the
 * dev reads it. The group page below used to be the exception — a technical
 * as-built page about the registry. It is NOT any more: Thu widened the rule to
 * it on 2026-11-21 and it is now written for the people who SELL these boxes.
 *
 * SHAPE OF THE TOP SEARCH PAGE:
 *   1 Tóm lại — the whole band as one table
 *   2 Khi nào dải hiện, và tiêu đề là gì
 *   3 Job nào được lên dải
 *   4 Xếp theo gì, hiện bao nhiêu thẻ
 *   5 Mỗi slide tối đa một job của một công ty
 *   6 Xoay vòng
 *   7 Giao diện
 *
 * SHAPE OF THE BOARD STRIPS PAGE (/trang/board-strips), the same spine over two
 * areas at once — "Tin tuyển dụng nổi bật" and "Đừng bỏ lỡ những tin này!" on
 * the three mega-menu board pages:
 *   1 Tổng quan  (ba khối khi bấm Tìm)
 *   2 Bước 1 — Lọc: tin nào được vào dải
 *   3 Bước 2 — Xếp hàng chờ lên hiển thị  (+ diagram 'board-strip-queue')
 *   4 Bước 3 — Bốc từng lượt, 5 phút một lần
 *   5 Bước 4 — Xáo chỗ trước khi lên màn hình
 *
 * FOUR STEPS, NOT THREE, and NO SALES SCRIPT — both Thu's, 22/11, from
 * annotations on the rendered page. The filter is step 1 ("bước 1: là filter"),
 * so her three bước shifted down; and "Nói gì với khách" is gone entirely,
 * "để sales tự nói". The page states the mechanism and stops there.
 *
 * SHE ALSO KILLED A CLAIM THAT WAS THE WHOLE SALES PITCH, and she was right:
 * "bậc càng cao thì vòng càng ngắn, tin lên càng thường xuyên" is not how this
 * works. Tier decides WHICH strip a posting enters, nothing more. Cycle length
 * is (queue ÷ cards) × 5 min, so it depends on how many postings happen to sit
 * in that strip — a market fact about who buys which rung, not a rule the
 * system enforces. I had asserted the Nổi bật pool is "nhỏ hơn hẳn" and never
 * checked it; it is plausible and unverified, and nothing guarantees it. The
 * claim is gone from the page along with the section that carried it. Do not
 * reintroduce it in any form.
 *
 * Other annotations applied the same day: no lead paragraph, no date stamp, no
 * module-link button (hideModuleLink), no "còn hạn nhận hồ sơ" in the filter,
 * no line about the tax code at all — "remove", so the explanation of why it is
 * absent went too — and the diagram lost its footnote box.
 *
 * TERMS ARE THE CLIENT'S, SET 22/11: "dải" → SECTION, "bậc tin" → PLACEMENT.
 * Her own Notion already says "các job đang open có placements ở đó", so this
 * aligns the page with the words she writes in. Applied to the page text, the
 * screenshot captions, the diagram and the page lead in pages.json. Note that
 * "placement" here is the thing a product sells into a section, which is how
 * she uses it — not the Admin registry row of the same name.
 *
 * AND NO TIER NAMES IN THE TABLE: "remove basic plus vì tùy thuộc KH đặt
 * setting cho product". Which rung sells which section is configuration, so
 * naming Basic Plus on the page freezes a setting as if it were a rule. The
 * table now says a section takes the job that holds its placement, and the
 * note says the mapping lives in Admin.
 *
 * SECOND STYLE PASS, same day, against two of her own Notion docs (CV keyword
 * search, Block employer): a short scope paragraph up top, numbered sections
 * with plain titles, small tables with short cells, one point per sentence,
 * and very little bold. Bold had been carrying emphasis on nearly every line
 * here, which is what made it read as dense even after the length came down.
 *
 * SETTLED 22/11: 40 cards for the lower section, "40 như hiện tại". She had
 * questioned it ("dải dưới lấy 30 chứ?"); the 30/40 pair came off staging on
 * 21/11 and she has now confirmed it as the rule, so it is no longer a reading
 * that happens to match. With the rounding clause restored, 40 gives a company
 * 4 cards and 30 gives 3 — both already on the page.
 *
 * TWO DIFFERENT 10% ON ONE PAGE, now spelled out. Section 3's is 10% OF THE
 * CARDS in a round (3 of 30, 4 of 40); section 4's is 10% OF THE POOL, the
 * point past which the 1-in-10 spacing cannot fit all of a company's jobs into
 * one cycle. Same rule behind both, different sets counted, and the page said
 * "10%" for each. Found by running the Logic chung session's probe — read a
 * page's own claims against each other ACROSS sections, not only within one —
 * after they found their §2 selling frequency off tier while their §8 listed
 * exactly that under do-not-promise.
 *
 * AND THIS PAGE NO LONGER HAS A DO-NOT-PROMISE LIST to check the rest against.
 * Thu removed it with the sales section on purpose ("để sales tự nói"), which
 * is her call, but it means the self-check that caught their contradiction
 * does not exist here. Claims on this page have to be checked against the
 * group page instead.
 *
 * FOUR RULES CAME BACK after the "ngắn gọn hơn" cut dropped them, 22/11.
 * Enumerating what that cut removed — from the diff, not from memory — gave 25
 * lines gone, and almost all of them were explainers that deserved to go: the
 * static-grid and column counts, the personalised band title, the levers, the
 * acceptance check. Four were RULES and nothing else on the page carried them:
 *   - which placement applies when a job holds several (highest still in date)
 *   - an archived product drops the job from both sections
 *   - a section never borrows from the other to fill its cards
 *   - a section with nothing eligible hides entirely
 * They are back in section 2 as one line each. The lesson is the cut itself:
 * shortening deletes rules and explainers at the same rate unless you diff it
 * afterwards, and the page reads fine either way, so nothing signals the loss.
 * The Logic chung session noticed the archive rule was live but missing here.
 *
 * ADJACENT AND STILL OPEN: the restored rule covers an archived PRODUCT. The
 * question put to Thu covers an archived COMPANY, which the build handles
 * elsewhere (D-3, every public read). A salesperson will not distinguish the
 * two, so whoever answers one should be asked about the other.
 *
 * AND A FIFTH, LOST EARLIER AND BY A DIFFERENT MECHANISM: "làm tròn xuống,
 * thấp nhất 1 thẻ" was in the cap sentence at 6509f15 and went out inside
 * a1e8645, the Sales rewrite — not cut, but dropped while the sentence around
 * it was being rebuilt. Nothing on the page carried it afterwards, the cap
 * still read correctly for 30 and 40, and three later audits read that exact
 * line without being able to see it, because every one of them asks whether
 * what is there is true. The Logic chung session lost the identical clause the
 * same way and found it first.
 * It matters more now than when it was written: it is what answers Thu's open
 * 30-or-40 question for any card count that is not a multiple of ten — a
 * 25-card section gives a company 2, not 2.5, and a 5-card section gives 1,
 * not 0.
 * NOTE ON METHOD: the full sentence-level diff I ran to look for this flooded
 * — 175 of 217 units reported missing, because the extractor pulled the file's
 * comment blocks in as page text. The targeted check for one clause is what
 * answered it. An enumeration is only as good as what it enumerates over.
 *
 * TWO MORE FOUND BY READING THE WHOLE PAGE AGAINST ITSELF, 22/11, after the
 * Logic chung session found a SECOND cross-section contradiction on their page
 * and argued the rate is too high to treat as anecdote. The page is short
 * enough now to read end to end, and that beat every regex written today.
 *   - "Placement đang chạy là cái còn hạn và CAO NHẤT" — caused by the rename.
 *     The sentence was about the posting TIER, which really is ordered; putting
 *     "placement" in its place moved "cao nhất" onto a noun that has no
 *     ordering at all. Now the PRODUCT is what has a level and the placement is
 *     what it sells. Family F, self-inflicted by find-and-replace.
 *   - The shuffle said "ngẫu nhiên, xác suất công bằng" in one sentence and
 *     "xáo xong vẫn không để hai thẻ cùng công ty cạnh nhau" two sentences
 *     later. That reads as a repair after the fact and hands a developer the
 *     wrong algorithm; it is uniform over the arrangements that KEEP the gap.
 *     Said in one breath now — and note this is the shuffle-side twin of the
 *     construction-not-repair warning further up.
 *
 * THIRD ANNOTATION PASS, 22/11. Twelve items, all applied. The ones that are
 * rulings rather than wording, so nobody puts them back:
 *   - "mega menu" is not the client's word for those pages. They are the JOBS
 *     pages, and the boxes on them are SECTIONS. "Khối" is gone too — one noun
 *     for one thing.
 *   - THE TWO 10% ARE ONE RULE after all, and she is right. I had split them
 *     into 10%-of-cards and 10%-of-pool and spelled out the difference; her
 *     answer was "ủa 10% chỗ này và ở bước 2 giống nhau chứ" plus "nói nhanh
 *     cái rule là jobs cùng cty chỉ đc hiển thị 10%". The second denominator
 *     was my framing, not a second rule: a company with more jobs than the one
 *     10% allows simply takes turns. Stated once, up front, as the rule, with
 *     the 10-place spacing demoted to how it is achieved.
 *   - NO CLAIMS ABOUT HOW ADMIN CONFIGURES PRODUCTS. "Hai section không giao
 *     nhau" is out — "mình ko kiểm soát đc cách admin set products và
 *     placement" — and with it the three bullets that depended on the same
 *     assumption: which product wins when a job holds several, archived
 *     products, and borrowing between sections. A page cannot state as a rule
 *     what an operator can reconfigure. Note this reverses the restore made
 *     earlier the same day: those four lines were real rules, and they are out
 *     because they are not OURS to state, not because they were wrong.
 *   - The foot's "Trang con" list is suppressed whenever a page declares
 *     siteLinks, since the header already lists the same routes.
 *
 * HELD FOR A DEV TASK, NOT FOR THIS PAGE (her item 9, verbatim): "lưu ý giữ
 * như build hiện tại về cái này. cái này note ko phải để đưa vào documents mà
 * là để xiu nữa tôi nhờ bạn viết task cho dev và nhờ bạn viết rõ những điểm
 * dev cần thay đổi." So: she will ask for a dev task spelling out what has to
 * change, and one behaviour is to be left as the build has it. WHICH bullet
 * that annotation was attached to could not be recovered — items 5 through 11
 * all carry the same selector and only their order separates them. Ask her
 * when the task is requested; do not guess it onto the page.
 *
 * AND IT IS SHORT ON PURPOSE — ~5.000 characters, about the length of her own
 * Notion page. She asked twice: "theo đúng bố cục của notion", then "ngắn gọn
 * hơn!!!". The first pass kept her six blocks but filled them with our tables
 * (a strip-comparison table, the frequency table and its worked rows, a Q&A
 * table, the refresh table, the levers list, a worked example) and came to
 * 13.400 characters. Those were ours, not hers, and the length was the problem
 * she was pointing at both times. They are gone; the rules they carried stayed
 * as single clauses:
 *   - do not quote a frequency  → one clause in §3
 *   - thin pool shows fewer cards → one clause in §3
 *   - the over-10% exception to one-turn-per-cycle → one clause in §4
 *   - tier sorts only in the search results list → the note under §1's table
 * DO NOT GROW IT BACK. A new rule becomes a clause inside one of her six
 * blocks, not a table and not a section. If a table feels necessary, that is
 * the signal to ask her, not to add it.
 *
 * THIS SHAPE IS THU'S, NOT OURS (2026-11-22, second pass). She sent the Notion
 * page back and asked for the page to follow HER layout exactly — "sửa i chang
 * như cái tôi viết nha, theo bố cục như vậy, chỉ là refine cho câu từ nó đúng
 * logic và rõ ràng hơn". Her page runs: Tổng quan (including what the search
 * does) → the eligibility line → Bước 1 → Bước 2 → Bước 3 → one sentence for
 * Sales. The eleven-section version written earlier the same day was our
 * expansion of it and is gone; everything in it that survived was folded into
 * the block of hers it belongs to, not kept as a section of its own:
 *   - "Ba trang, một màn hình" and the strip UI  → section 1
 *   - the search behaviour, which she puts in her overview  → section 1
 *   - the frequency formula and the refresh table  → section 4, since they are
 *     what "xoay vòng như vậy" means in practice
 *   - "Nói gì với khách" Q&A and the do-not-promise list  → section 6
 * DO NOT re-expand this into sections. If something genuinely new has to be
 * said, it goes inside one of her six blocks.
 *
 * SHE ALSO RULED ONE THING OUT, explicitly, and it had been on the page: the
 * eligibility list must NOT mention the tax code or the company being active,
 * because "những điều kiện này phải được đáp ứng mới đăng đc job nên nó hiển
 * nhiên". Section 2 now says why it leaves them out rather than listing them.
 *
 * BUT HER REASON COVERS THE ENTRY CHECK, NOT THE ONGOING ONE — open, and it is
 * a product rule, so nobody here should guess it onto the page. "Phải được đáp
 * ứng mới đăng đc job" is true and makes the condition redundant AT POSTING
 * TIME. It does not follow that the condition stops mattering afterwards, and
 * the page before this edit implied the opposite: it carried "công ty đang hoạt
 * động và đã có mã số thuế" inside condition 1, next to "đang bật hiển thị,
 * chưa hết hạn" — i.e. as a state re-checked while the posting is live, beside
 * other states that change over time.
 * So the unanswered question is: a company deactivated (or its tax code pulled)
 * AFTER its postings went up — do those postings drop off the strips, or keep
 * running until they expire? Her ruling is followed either way, because the row
 * is gone from the entry list; what is missing is whether a separate ongoing
 * rule belongs somewhere else on the page. Asked 2026-11-22. Do not resolve it
 * from the build: under the guide-is-the-requirement ruling the code would only
 * say what happens today, not what should.
 *
 * THAT LAST SENTENCE WAS HALF WRONG, and the Logic chung session called it on
 * 2026-11-22. The ruling governs WHAT THE PAGE SAYS; it does not govern whether
 * the REASON behind it is true of the system. Her reason is a factual claim —
 * "these must already hold to post" — and a factual claim is checkable. Checked
 * independently here against svn-be origin/dev 86a1d09bb rather than taken:
 *   - CompanyPublicSql.publiclyExposed(alias), javadoc headed "Decision D-3":
 *       status = 'ACTIVE' AND (mst IS NOT NULL
 *                              OR (company_kind = 'FOREIGN' AND foreign_tax_id IS NOT NULL))
 *   - PublicReadRepositoryAdapter is where the jobseeker side evaluates it, and
 *     its "Placement-public-content slice" — findOpenJobsByTierCodes — applies
 *     publiclyExposed(c) on the tier-code queries, i.e. on OUR two strips.
 *   - JobPlacementBoardReaderAdapter composes it per query off clock.instant(),
 *     beside j.status OPEN and the application window. So it is evaluated ON
 *     EVERY READ, never once at posting time.
 * Which means her premise is false as a reason for dropping the condition
 * permanently: archive a company today and every posting it has paid for leaves
 * every public surface at once, mid-campaign. The entry row still stays out —
 * her ruling is unambiguous and the condition IS redundant at entry — but the
 * ongoing rule is a real question, not a hypothetical one.
 * TRAP for whoever writes that rule: never "phải có mã số thuế" flatly. Foreign
 * customers carry foreign_tax_id and no mst; the mst-only spelling hid every
 * foreign company from every public surface until it was fixed on 2026-10-12.
 *
 * WHICH RULES THESE PAGES STATE. Thu settled this on 2026-11-21: the pages
 * state THE RULES WE WANT — the agreed target — not the behaviour deployed
 * today. So a page may describe something the build has not caught up with,
 * and that is correct, not a bug in the page. It still names no gap (see the
 * list above): the client reads one set of rules, stated plainly, and the
 * distance to today's build lives in the ticket.
 *
 * SECTIONS 4-8 WERE REDESIGNED ON 2026-11-21 (Thu's brief, from SRM-1742 plus
 * four wants: company ≤10%, never adjacent, whole-batch swap every 5 min, equal
 * exposure). Three moves, and each one is load-bearing:
 *   - TIER LEFT THE SORT KEYS. It only gates WHICH strip a posting may enter.
 *     This is the precondition for the other two: while tier sorts first, a
 *     company on the top rung has its 3 cards dragged adjacent to the head of
 *     the strip — inside the 10% cap and still wrong. Thu reached the same
 *     conclusion independently ("nếu muốn rotate thì ko cần posting ladder").
 *   - SPREAD THE QUEUE, THEN SLICE IT (revised 2026-11-22, see below). Spacing
 *     is applied while the queue is BUILT, not while it is cut. Once no two of
 *     a company's postings sit within 10 places of each other, any consecutive
 *     window of 30 holds at most 3 of them, so plain slicing is safe and the
 *     round-robin deal is unnecessary.
 *   - FREQUENCY REPLACED RANK as what a product buys. Cycle length =
 *     (pool ÷ cards) × 5 min, so narrowing which rungs sell a slot is now the
 *     only lever that makes a posting appear more often. That is the sales
 *     story once everyone is guaranteed a turn.
 * THE CAP PAYS FOR THE SPACING GUARANTEE, AND ONLY A CONSTRUCTION COLLECTS IT.
 * Section 6 promises "never adjacent" with no hedge, and it can because the cap
 * holds a company to 3 of 30 cards: a non-adjacent arrangement exists whenever
 * the largest company stays at or under ceil(n/2), and the cap keeps it far
 * inside that. Two things follow, and both are easy to lose in a rewrite:
 *   - DO NOT soften section 6 to match the home bands page. That page says
 *     "best effort" because those bands have NO cap at all, so one company can
 *     hold most of a pool and no algorithm can space it. Different cause, not
 *     a sloppier version of the same rule.
 *   - BUILD IT AS A CONSTRUCTION, NOT A REPAIR. Section 6 says to deal each
 *     round from nothing, always taking the company with the most cards left
 *     and never the company just placed; that is the constructive proof of the
 *     bound and it succeeds on every feasible instance. A repair pass that
 *     walks an existing order patching collisions forward — what the build does
 *     today — can give up on an instance that IS feasible, because it never
 *     looks backward. Implement it that way and the promise on the page quietly
 *     stops being true while both the page and the cap still look correct.
 * Reached with the Home session on 2026-11-21, each of us holding one half.
 *
 * THE SHUFFLE MUST BE DERIVED FROM THE ROUND, NOT ROLLED AT RENDER TIME. Same
 * shape of trap as the construction-above: the rule on the page is sound and
 * only the implementation can lose it. Section 7 says the order is random and
 * that everyone inside one 5-minute period sees the SAME order — those two
 * clauses are one rule, not a rule plus a nicety. The order has to be a pure
 * function of (area, period index); a shuffle rolled per request looks like it
 * satisfies "ngẫu nhiên, đổi mỗi vòng" and quietly breaks two things at once:
 *   - CACHING. Every CDN / ISR copy gets a different page, and whichever copy
 *     happens to be cached then serves that one order for its whole lifetime.
 *     The rotation stops rotating for most visitors while the code still looks
 *     correct. The rotation class in svn-be is emphatic about this and gives
 *     exactly this reason; the Home session surfaced it on 2026-11-22.
 *   - THE EQUAL-AIRTIME CLAIM the shuffle was introduced to deliver. A frozen
 *     cached copy puts one posting back in a fixed slot — the precise failure
 *     Thu's "thứ tự xuất hiện random, có xác suất công bằng" was meant to end.
 * Deriving from the clock is also what lets the response stay byte-identical
 * for the rest of the period and be cached for exactly that long.
 *
 * THE SPACING RULE COSTS "EVERY POSTING ONCE PER CYCLE", AND THE REWRITE OWED
 * THAT DEBT FOR HALF A DAY. Separating F postings of one company by 10 places
 * needs 9 others between each pair, so a queue holds at most (others / 9) + 1
 * of them. Run Thu's own example through it — 100 postings, 50 from one
 * company — and only about 6 of those 50 fit in a cycle; each of them surfaces
 * once in roughly 8 cycles while everyone else surfaces every cycle. That IS
 * her "chấp nhận xác xuất xuất hiện của job công ty đó sẽ thấp hơn", so the
 * rule is hers and correct; what was wrong was section 6 still promising every
 * eligible posting exactly one turn per cycle, and section 8's formula quietly
 * assuming the same. Both now carry the ≤10%-of-pool qualifier.
 * At the far end the arithmetic decides a question that looked like a product
 * decision: a pool of 55 where 50 belong to one company admits ONE of them, so
 * the strip shows about 6 cards, not 30. Running short is not an extra rule to
 * choose — it is what the spacing rule already says when there is nothing left
 * to separate with, which is why "dải hiện ít thẻ hơn, không nới luật" is back
 * on the page after the rewrite dropped it. Raised by the Logic chung session
 * on 2026-11-22 as a question for Thu; it did not need her, it needed the
 * arithmetic, and the answer agrees with the group page's existing §4 cell.
 *
 * THAT CEILING IS NOT A FREQUENCY, AND IT WAS ON THE PAGE AS ONE FOR AN HOUR.
 * (others / 9) + 1 is the most a queue COULD hold, reached only if the builder
 * interleaves well. Two reasonable greedies, both simulated on Thu's 100-with-50:
 *   - restart the scan after every placement, first eligible wins → 6, the bound
 *   - repeated full passes, appending each eligible item as encountered → 2,
 *     because the first pass spends all 50 separators in one block and the
 *     second pass can then fit a single one of the big company's postings
 * Same rule, same pool, a factor of three apart (≈8 cycles against ≈25). So the
 * page states the ceiling AS a ceiling and tells Sales not to quote a figure;
 * the figure belongs to the builder, and nobody here has read it. The Logic
 * chung session caught this on 2026-11-22 after I had written "~8 vòng" as the
 * behaviour — third time in two days that a derived number read as an observed
 * one, which is now the thing to look for first in anything either page states.
 * FOR THE TICKET: the requirement is the interleaving builder, for the same
 * reason as construction-not-repair above — the rule on the page is sound and
 * only the implementation can give away what it promises.
 *
 * REWRITTEN FOR SALES ON 2026-11-22 from Thu's own Notion page "Job placement"
 * (app.notion.com/p/Job-placement-420b88bd999780849341c969c3b019b9), which she
 * wrote as the explanation a salesperson should be able to give. Her text is
 * the source for four changes, and each one is a RULE change, not a rewording:
 *   - THE SPACING MOVED TO THE QUEUE. "cứ 10 job thì chỉ có 1 job của công ty
 *     đó" is one rule doing both jobs: 1-in-10 along the queue IS the 10% cap
 *     for a 30-card window, and it also guarantees the gap. The old sections 5
 *     and 6 (deal-don't-slice, then a separate per-round cap) collapsed into
 *     section 5. Simpler, and it is hers.
 *   - THE ORDER ON SCREEN IS RANDOM. Her reason is exact: slice a queue in
 *     fixed blocks of 30 and some posting is forever first, another forever
 *     last. The shuffle still may not break the gap rule, so it is a shuffle
 *     over the arrangements that keep same-company cards apart.
 *   - THE OVER-POSTING COMPANY DILUTES ITSELF, and she accepted it in writing:
 *     "chấp nhận xác xuất xuất hiện của job công ty đó sẽ thấp hơn". That
 *     replaces the old "bể quá mỏng → dải bớt thẻ xuống" escape hatch, and it
 *     turns into the sales line in section 11: posting more does not buy more
 *     of the strip, moving up a rung does.
 *   - SEARCH GOT ITS OWN SECTION (9). Her page is explicit that the two strips
 *     FILTER on the search, and that a third block below them returns the
 *     normal search result, placement or not — which is also the one surface
 *     here where tier still sorts.
 * THE GROUP-KEY TRADE-OFF ASKED ON 2026-11-21 IS CLOSED BY THIS. It only
 * mattered because position inside a round was fixed; with the order shuffled
 * every round, the group key picks which ROUND a posting rides in and nothing
 * else, so every posting now has both equal airtime and an equal shot at the
 * top slot. "Nhóm đông tin nhất" left the page; grouping stayed.
 *
 * KEPT OUT OF THE BOARD STRIPS PAGE, same reasons — they belong to the ticket:
 *   - the band split is enforced by WHICH product ticks which area, not by a
 *     rung test in code, so "Basic Plus trở lên" is a configuration the page
 *     states as a rule and the ticket has to keep true
 *   - today the two areas are cut at items_shown with no rotation at all, tier
 *     still sorts, and the cap only demotes; the page states the target rules
 *     without naming any of that
 *   - 30 / 40 cards read off staging on 2026-11-21 (the trending strip drew
 *     exactly 30, the free strip 23 of its 40 — its pool is smaller)
 *
 * KEPT OUT OF THE PAGE ON 2026-11-21, because they are internal findings and
 * not logic the client needs. Measured on production 20/11/2026; move them to
 * the ticket or the spec site if they still need an owner:
 *   - Product "TOP JOB - TEST" is Active at 3.000.000 đ and sells this slot.
 *     Looks like test data; should be Inactive.
 *   - Placement load counts 2.626 for this slot, the search endpoint returns
 *     2.624 — the dashboard also counts jobs on archived products.
 *   - The "hiển thị trong N ngày đầu" field on the slot row is a no-op here.
 *   - Placement load treats this slot as rotation-free; once the band rotates
 *     that has to change or "Waiting for a turn" reports nonsense.
 *   - The pool is 2.626 postings over 22 companies, 2.592 of them MBBANK's,
 *     so one company per slide holds for about eleven slides and no further.
 *     Narrowing which products sell this slot is the only real fix.
 *
 * VOICE OF THE TOP SEARCH PAGE — Thu picked a colleague's Notion docs as the
 * model on 2026-11-21 and the page is written to match them:
 *   - opens with ONE callout: what the doc covers, then the status line
 *   - sections are "1." "2.", plain statements, never "§1 · Bước 1 — …"
 *   - table cells are a few words; anything longer goes in a list under it
 *   - one fact per line, flat: topic, colon, answer. No reasoning chains
 *   - examples are one line with an arrow: "VD: … → …"
 *   - NO code identifiers in reader-facing text. Not refreshed_at but "lần làm
 *     mới gần nhất"; not items_shown but "số thẻ"; not rotation_seconds but
 *     "chu kỳ". Name things the way an admin sees them on screen. No ticket
 *     codes either.
 * Detail that only makes sense with a code name belongs in the ticket, not here.
 * So do decision markers: a client reading a guide does not care who signed it
 * off, only how the thing works.
 *
 * VOCABULARY. Never "vẽ" for what the user sees — it reads as jargon. Use
 * "hiện" / "hiển thị". Never "ai" for jobs; jobs are not people.
 *
 * Code read from svn-be origin/dev: the Top search page on 2026-11-20, the
 * group page re-read on 2026-11-21 (head 86a1d09bb). NOTE for whoever edits
 * next: the local svn-be checkout sits on a September commit, so read these
 * files with `git show origin/dev:<path>`, never from the working tree.
 */
import type { PageDoc, ModuleDoc } from '../docs'


const STAMP_GROUP = 'Cập nhật 21/11/2026.'

/* A DATE PER PAGE, never one shared constant: two guide pages are refreshed on
   different days, and a shared stamp would re-date the one nobody touched. */

export const JOB_DISPLAY_PAGE_DOCS: Record<string, PageDoc> = {
  /* ────────────────────────────────────────────────────────────────────────── */
  'top-search': {
    blocks: [
      {
        kind: 'shot',
        src: '/shots/job-display/top-search-on-page.jpg',
        where: 'Jobseeker site',
        caption: 'Dải Top search là khung đỏ. Nằm trên đầu trang kết quả tìm kiếm, phía trên khối *Kết quả tìm kiếm*.',
        note: 'Ảnh để thấy vị trí của dải trên trang.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tổng quan' },
      {
        kind: 'p',
        text: 'Dải Top search là hàng thẻ việc làm trên đầu trang kết quả tìm kiếm. Đây là một ô có bán: job chỉ lên dải khi đã mua ô này.\n\nDải luôn hiện, trừ khi không còn job nào vào được dải.',
      },
      {
        kind: 'table',
        note: 'Tên bộ lọc không ghép vào tiêu đề, dù ứng viên đã chọn bộ lọc hay chưa.',
        cols: ['Hạng mục', 'Dải chạy thế nào'],
        rows: [
          ['Số thẻ', 'Nhiều nhất 20 — 5 slide × 4 thẻ. Mỗi slide đủ 4 thẻ, hàng ít job hơn thì ít slide hơn'],
          ['Lọc theo', 'Từ khoá và bộ lọc trên thanh tìm kiếm'],
          ['Thứ tự', 'Job làm mới gần nhất đứng trước'],
          ['Một công ty trong 1 slide', 'Nhiều nhất 1 thẻ'],
          ['Xoay vòng', '5 phút tịnh tiến 4 job'],
          ['Tiêu đề', 'Có từ khoá: *Việc {từ khoá} dành cho bạn*. Không gõ từ khoá: *Việc làm dành cho bạn*'],
          ['Nút Xem thêm', 'Không có'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Bước 1 — Lọc: job nào vào được dải' },
      {
        kind: 'list',
        items: [
          'Job đang mở và đang hiển thị trên site.',
          'Job đã mua ô Top search: bậc tin đang chạy có bán ô này, **hoặc** job có add-on hiển thị còn hạn. Add-on mua kèm vào job đang chạy bậc bất kỳ, không cần đổi bậc.',
          'Nếu ứng viên đã gõ hoặc đã lọc thì job còn phải khớp với tìm kiếm. Bộ lọc ở đây đúng là bộ lọc của trang kết quả: khu vực, ngành nghề, vị trí, kỹ năng, cấp bậc, mức lương, loại hợp đồng, kinh nghiệm.',
          'Dải và danh sách kết quả bên dưới luôn trả lời cùng một câu hỏi: đổi một bộ lọc thì cả hai đổi theo.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Bước 2 — Xếp hàng chờ lên dải' },
      {
        kind: 'list',
        items: [
          'Mọi job vào được dải xếp thành một hàng, job làm mới gần nhất đứng trước — không phải ngày đăng.',
          'Menu sắp xếp của ứng viên (VD *Lương cao nhất*) không đổi thứ tự dải. Nó chỉ đổi danh sách kết quả bên dưới.',
          'Luật: trong một slide 4 thẻ, mỗi công ty nhiều nhất **1 thẻ**; trên cả 20 thẻ nhiều nhất **5 thẻ**.',
          'Nếu không còn đủ job của công ty khác để xếp xen vào, dải **vòng lại** lấy job đã hiện cho đủ thẻ, chứ không cho một công ty chiếm 2 thẻ trong cùng một slide. Job của các công ty khác vẫn luân phiên theo đúng tỉ lệ **1 thẻ trong 4**.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Bước 3 — Bốc job lên dải' },
      {
        kind: 'list',
        items: [
          'Mỗi slide đủ **4 thẻ**. Số slide = số job trong hàng chia cho 4, **bỏ phần dư** — nhiều nhất 5 slide. VD hàng 18 job: 4 slide, job dư chờ nhịp sau.',
          'Hàng chỉ có **1–3 job** thì dải **vẫn hiện**: một slide với bấy nhiêu thẻ.',
          'Không lấy job chưa mua ô này vào cho đủ thẻ.',
          'Hàng job được chốt ở đầu mỗi chu kỳ. Job làm mới giữa chu kỳ vào hàng từ chu kỳ sau — không cướp lượt của job đang chờ.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Bước 4 — 5 phút tịnh tiến 4 job' },
      {
        kind: 'list',
        items: [
          'Mỗi 5 phút cả hàng tịnh tiến 4 chỗ: slide 2 lên slide 1, 4 job kế tiếp vào slide 5.',
          'Ai mở trang trong cùng 5 phút đó đều thấy cùng một lượt.',
          'Đi hết hàng thì quay lại đầu hàng, nên mọi job trong hàng đều tới lượt, không chỉ 20 job đầu.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: một hàng 18 job',
        scenario: 'Ứng viên mở trang, rồi tải lại sau mỗi 5 phút.',
        cols: ['Slide', 'Mở trang', 'Sau 5 phút', 'Sau 10 phút'],
        rows: [
          ['Slide 1', 'Job 1–4', 'Job 5–8', 'Job 9–12'],
          ['Slide 2', 'Job 5–8', 'Job 9–12', 'Job 13–16'],
          ['Slide 3', 'Job 9–12', 'Job 13–16', 'Job 17, 18, 1, 2'],
          ['Slide 4', 'Job 13–16', 'Job 17, 18, 1, 2', 'Job 3–6'],
        ],
        note: 'Hàng 18 job thì dải lấy 16 thẻ, tức 4 slide — job 17 và 18 chờ nhịp sau. Mỗi nhịp cả bảng dịch lên một dòng, nên mọi job đều tới lượt đứng slide 1. Dải lấy ít thẻ hơn số job trong hàng nên không job nào hiện hai lần cùng lúc.',
      },
    ],
  },
  /* ────────────────────────────────────────────────────────────────────────── */
  'board-strips': {
    /* Thu, 22/11: the page ends on its own closing block, so the generated
       "back to the module page" button under it was one ending too many. */
    hideModuleLink: true,
    /* Thu, 22/11: the header showed one route while the page documents three. */
    siteLinks: [
      { label: 'Theo khu vực', path: '/viec-lam/dia-diem' },
      { label: 'Theo ngành nghề', path: '/viec-lam/nganh-nghe' },
      { label: 'Theo ngành', path: '/viec-lam/nganh' },
    ],
    blocks: [
      {
        kind: 'shot',
        src: '/shots/job-display/board-trending.jpg',
        where: 'Jobseeker site',
        caption: 'Section Tin tuyển dụng nổi bật là khung đỏ. Nằm dưới thanh tìm kiếm, lưới 3 cột.',
      },
      {
        kind: 'shot',
        src: '/shots/job-display/board-announcement.jpg',
        where: 'Jobseeker site',
        caption: 'Section Đừng bỏ lỡ những tin này! là khung đỏ, nằm dưới section trên, lưới 4 cột.',
        note: 'Hai ảnh để thấy vị trí của hai section trên trang.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      /* ───────────────────────────────────────────────────────────────── */
      /* ───────────────────────────────────────────────────────────────── */
      /* ───────────────────────────────────────────────────────────────── */
      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tổng quan' },
      {
        kind: 'p',
        text: 'Ba trang Jobs — Theo khu vực, Theo ngành nghề, Theo ngành — dùng chung một màn hình. Trên đó có hai section hiện job đã mua placement.\n\nKhi ứng viên bấm Tìm, trang có ba section.',
      },
      {
        kind: 'table',
        note: 'Chưa gõ gì thì trang chỉ có hai section đầu.',
        cols: ['Section', 'Hiện job nào', 'Số thẻ'],
        rows: [
          ['Tin tuyển dụng nổi bật', 'Job khớp tìm kiếm và có placement của section này', '30'],
          ['Đừng bỏ lỡ những tin này!', 'Job khớp tìm kiếm và có placement của section này', '40'],
          ['Danh sách kết quả tìm kiếm', 'Mọi job khớp tìm kiếm, **bao gồm cả job không mua placement**. Đây cũng là chỗ duy nhất placement còn xếp thứ tự', 'Như tìm kiếm thường'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Bước 1 — Lọc: job nào vào được section' },
      {
        kind: 'list',
        items: [
          'Job đang mở và đang hiển thị trên site.',
          'Job có placement của đúng section đó.',
          'Nếu ứng viên đã gõ hoặc đã lọc thì job còn phải khớp với tìm kiếm.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Bước 2 — Xếp hàng chờ lên hiển thị' },
      {
        kind: 'list',
        items: [
          'Gom job thành nhóm theo trục của trang: tỉnh/TP, ngành nghề, hoặc ngành.',
          'Trong mỗi nhóm, job làm mới gần nhất đứng trước. Job mới vào hàng cũng xếp theo đúng thứ tự đó.',
          'Luật: job của cùng một công ty chỉ được chiếm 10% số thẻ của section — làm tròn xuống, thấp nhất 1 thẻ. Section 30 thẻ thì nhiều nhất 3 job, section 40 thẻ thì 4. Cách làm: xếp hàng sao cho hai job của một công ty luôn cách nhau ít nhất 10 chỗ.',
        ],
      },
      {
        kind: 'diagram',
        id: 'board-strip-queue',
        note: 'Ô màu A là job của một công ty đang đăng rất nhiều. Hàng trên là lúc xếp hàng, lưới dưới là lúc lên màn hình.',
      },
      {
        kind: 'list',
        items: [
          'Vì vậy công ty đăng càng nhiều job thì mỗi job của họ càng ít được hiện, phần dư phải chờ các vòng sau.',
          'Nếu bể job mỏng tới mức gần như chỉ còn một công ty, section sẽ hiện ít thẻ hơn chứ không nới luật ra để lấp cho đủ.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Bước 3 — Bốc từng lượt, 5 phút một lần' },
      {
        kind: 'list',
        items: [
          'Section lấy đúng số thẻ của mình từ đầu hàng, rồi thay cả cụm một lúc chứ không tịnh tiến từng job.',
          'Hết 5 phút lại bốc lượt kế tiếp. Ai mở trang trong cùng 5 phút đó đều thấy cùng một lượt.',
          'Đi hết hàng là hết một vòng, rồi xếp hàng lại từ bể job tại thời điểm đó. Trong một vòng mỗi job được lên đúng một lần — trừ công ty có nhiều job hơn mức 10% đó cho phép, thì job của họ thay phiên nhau qua các vòng nên thưa hơn.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Bước 4 — Xáo chỗ trước khi lên màn hình' },
      {
        kind: 'p',
        text: 'Thứ tự trên màn hình là xáo trộn ngẫu nhiên, nhưng có xác suất thống kê công bằng: mọi job trong lượt đều có cơ hội đứng đầu, đứng giữa hay đứng cuối như nhau.\n\nXáo trong số các cách xếp không có hai thẻ cùng công ty đứng cạnh nhau — luật khoảng cách vẫn giữ, chứ không phải xáo xong rồi mới sửa.\n\nXáo một lần cho cả lượt và dùng chung cho mọi người, không phải mỗi người một thứ tự. Và vì thứ tự đổi mỗi lượt nên không có “ô số 1” để bán.',
      },

    ],
  },
}

/* ────────────────────────────────────────────────────────────────────────────
 * Group page — the common model, written for the people who SELL these boxes.
 *
 * SAME CONTRACT AS THE PAGES UNDER IT, set by Thu on 2026-11-21 and widened to
 * this page on the same day: a USER GUIDE FOR THE CLIENT, not a requirement for
 * the dev, and now in the voice of /trang/top-search. The old version of this
 * page was the exception — a technical as-built page about the registry, full of
 * column names and API paths. That exception is GONE. No code identifiers, no
 * ticket codes, no decision markers, no gap statements, no production figures.
 *
 * SHAPE:
 *   1 Tóm lại
 *   2 Khách mua gì khi mua một ô
 *   3 Năm luật đúng với mọi ô
 *   4 Một công ty được giữ mấy thẻ trong một ô
 *   5 Xoay vòng — bao lâu thì tới lượt tin của khách
 *   6 Giống nhau chỗ nào, khác nhau chỗ nào
 *   7 Tra cứu nhanh: tin của khách đang ở đâu
 *   8 Bán được gì, và không hứa gì
 *   9 Các trang trong nhóm này
 *
 * THE THREE THINGS THU ASKED THIS PAGE TO SETTLE (2026-11-21): how the
 * same-company rules differ between placements, how rotation works, and what is
 * common to every placement against what is special to one.
 *
 * SOURCES, read from svn-be origin/dev on 2026-11-21 — keep them here:
 *   - PeriodicRotation: `rotate` (banners, company strips: one position per
 *     period), `spreadPage` (job bands: pool laid out per cycle, one page per
 *     period, each owner's items spaced (k+offset)/m, then runs broken),
 *     `spreadSlides` (Top search: one owner per slide of 4, best effort),
 *     `conveyorWindow` / `conveyorPeriods`.
 *   - PublicReadService.drawJobs / drawnOnPage / rotate, BandGrid.keep.
 *   - TopSearchCycle (STEP 4, frozen line, window), TopSearchLineService,
 *     PgTopSearchLineAdapter, V927.
 *   - JobBoardSection.companyCap = max(1, pageSize / 10) — the brief's "trong 1
 *     section 1 công ty ko chiếm quá 10% jobs"; TopCompaniesOrder.arrange (the
 *     cap outranks the spacing; over-cap postings drop behind every other
 *     employer's, they are not removed); EsGroupedSections.order for the ES side.
 *   - SearchService.searchSpreadingEmployers (header preview + top-companies
 *     strip reuse the same 10% rule).
 *   - ORDER_LATEST_ROUND: the Mới nhất list is newest day first, then employer
 *     rounds — every company's freshest posting of the day, then every
 *     company's second.
 *   - JobFeed on dev: COMPANY_CAP 3, COMPANY_GAP 6, ROW 6 (job alert + search),
 *     seed = (candidate, day, surface, anchor). These surfaces are NOT sold.
 *   - PlacementLoadService: the two mega-menu strips are replayed with no
 *     rotation; Top search is replayed off the frozen line.
 *
 * THE PAGE STATES THE AGREED RULE, NOT TODAY'S BUILD (Thu, 2026-11-21: "user
 * guide là requirement, cái tôi muốn, ko phải cái thật sự build"). Where the
 * two differ the page is ahead on purpose — do NOT edit it back to match code,
 * and do not add a line saying the build differs. The gap belongs in the ticket.
 * The two mega-menu strips are the live case: they rotate on this page because
 * that is the rule Thu signed off on 2026-11-21, while the build still replays
 * them unrotated.
 *
 * KEPT OUT OF THE PAGE, deliberately:
 *   - "công ty đang hoạt động và đã có mã số thuế" as an ENTRY condition, cut
 *     from law 1 on 2026-11-22 under Thu's ruling for the strips page: a
 *     posting cannot be created unless both already hold, so listing them as
 *     entry rules is noise for Sales ("hiển nhiên"). The laws here cover every
 *     placement, so the ruling reaches this page. Do not restore the row.
 *
 * OPEN — AND HER REASON DOES NOT REACH AS FAR AS THE CUT DID (2026-11-22):
 *   Both conditions are re-evaluated on EVERY public read in today's build, not
 *   checked once at posting time. PublicReadRepositoryAdapter.publiclyExposed
 *   (read from svn-be origin/dev, 2026-11-22) is `status == ACTIVE AND (mst
 *   IS NOT NULL OR (kind == FOREIGN AND foreign_tax_id IS NOT NULL))`, its
 *   javadoc calls it decision D-3, and the placement slice
 *   (findOpenJobsByTierCodes / findFeaturedCompaniesByTierCodes) applies the
 *   SAME predicate — so it governs these two strips and the eight bands.
 *   Consequence: archive a company and every posting it has bought leaves every
 *   public surface at once, mid-campaign. The tax-code half is not a formality
 *   either; the javadoc says that without it "every unverified lead would
 *   surface publicly".
 *   So "self-evident at posting time" is true of entry and false of the ongoing
 *   state, and the cut removed both readings. Whether the AGREED rule should say
 *   postings drop off when a company is archived — or run to expiry — is Thu's
 *   call, not the build's. Nothing has been written onto the page either way.
 *   If it is ever written: NOT "phải có mã số thuế" flatly. Foreign customers
 *   have no mst and carry foreign_tax_id instead (V376, after the mst-only
 *   spelling silently hid every foreign company until 2026-10-12).
 *
 * §8 IS NOW THE ONLY DO-NOT-PROMISE LIST IN THIS GROUP (2026-11-22). Thu cut the
 * sales section from the strips page, so the prohibition index that caught §2
 * selling frequency off tier — §8 already forbade it — exists only here. Two
 * consequences. Keep §8 enumerating prohibitions, not just permissions: it is
 * the index every other claim gets read against. And when the strips page makes
 * a claim, check it against §8, because that page can no longer catch itself.
 * The dependency runs one way and did not exist before today.
 *
 * READ THE PAGE'S CLAIMS AGAINST EACH OTHER, not only each block against the
 * rule. §2 and §8 were each defensible alone and contradicted each other for
 * weeks; every check that reads one block at a time passes both.
 *
 * CARD COUNTS SETTLED 2026-11-22: Thu confirmed "40 như hiện tại", so the upper
 *   strip is 30 and the lower is 40. The digits did not change; their STATUS did.
 *   Until today 30/40 was an observation read off staging on 21/11 that both
 *   pages carried as if it were the rule. It is now the rule, stated by her —
 *   and under the guide-is-the-requirement ruling that difference is the whole
 *   point, because an observation and a rule look identical on the page. The
 *   five worked examples here (§4's note twice, §4's cap table, §5's
 *   cycle-length example, §6's row) stand as written, and law 1's restored
 *   "làm tròn xuống, ít nhất 1 thẻ" is what resolves any count she changes
 *   later without another conversation. Relayed via the board-strips session,
 *   not read from her page.
 *
 * RECEIVED FROM THU 2026-11-22 AND NOT APPLIED HERE — this one needs her, not a guess:
 *   - Vocabulary: "dải => Section, bậc tin => Placement", annotated on the strips
 *     page. NOT swept here, for two reasons. (a) This page's generic term is "ô"
 *     (93 uses) and "dải" (53) is a SUBTYPE of it; her mapping says what "dải"
 *     becomes and nothing about "ô", and this is the one page that has to name
 *     every kind of box. (b) "Placement" already appears here in the Admin sense
 *     — §7's "Product settings → Placement load" — so renaming the 12 "bậc tin"
 *     to Placement puts one word on two meanings, one of them a screen name.
 *     Ask her which word "ô" takes before touching either.
 *   - Counts of placement rows (47 / 28 / 19) and any production measurement.
 *     They date the page and sales does not sell by them.
 *   - That the strip asks the search for 8 cards in today's build while the
 *     agreed rule is 20 across 5 slides. A build gap belongs in the ticket.
 *   - The premium band on the search page ("The choice that sets you apart",
 *     12 postings after the third result): it is not a registry placement, and
 *     it has no page in this group yet.
 * ──────────────────────────────────────────────────────────────────────────── */

export const JOB_DISPLAY_MODULE_DOCS: Record<string, ModuleDoc> = {
  'Job display logic': {
    title: 'Logic hiển thị job — ô nào lấy tin nào, và mỗi công ty được mấy thẻ',
    lead:
      '**Tóm lại:** mọi chỗ hiện việc làm trên site ứng viên — dải trên trang chủ, dải trên trang kết quả tìm kiếm, dải trên các trang danh sách việc làm, banner — đều là **một ô có bán**. Khách mua một ô là mua **một suất trong bể tin của ô đó**, không phải mua một vị trí cố định.\n\nTrang này viết cho người đi bán: luật **chung cho mọi ô**, chỗ **khác nhau** giữa các ô, và hai câu khách hỏi nhiều nhất — *một công ty được chiếm mấy thẻ* và *bao lâu thì tin của tôi được hiện*.',
    headline: [
      '**Một ô hiển thị là một cái hộp trên một trang** — không phải một sản phẩm, không phải một tin. Tin vào ô khi bậc tin đang chạy của tin có bán ô đó, hoặc khi tin có add-on hiển thị.',
      '**Không ô nào bán vị trí.** Trong cùng một ô, mọi tin đã trả cùng một giá cho cùng một chỗ, nên thứ tự do luật của ô quyết định — không ai mua được chỗ đầu.',
      '**Mỗi ô có luật riêng về số thẻ một công ty được giữ**, và **vòng của mỗi ô dài ngắn khác nhau**. Hai điều này là gốc của gần hết câu hỏi *“sao tin này không hiện”* — mục 4 và mục 5.',
    ],
    blocks: [
      {
        kind: 'p',
        text: 'Trang này nói phần **chung cho mọi ô**. Mỗi ô có trang riêng nói cách ô đó chọn và xếp tin — xem mục 9.\n\nBa câu hỏi trang này trả lời: tin vào ô bằng đường nào, một công ty được giữ mấy thẻ trong một ô, và bao lâu thì tới lượt tin của khách.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '1. Tóm lại' },
      {
        kind: 'table',
        cols: ['Hạng mục', 'Luật chung cho mọi ô'],
        rows: [
          ['Ô hiển thị là gì', 'Một hộp trên một trang. Trang chủ có 8 dải, trang kết quả tìm kiếm có dải Top search, các trang danh sách việc làm có 2 dải, ngoài ra là banner'],
          ['Tin vào ô bằng', 'Bậc tin đang chạy có bán ô đó, **hoặc** add-on hiển thị gắn vào tin'],
          ['Tính từ lúc', 'Đăng tin — không phải lúc chọn gói trên form'],
          ['Thiếu tin thì', 'Hiện ít thẻ hơn. **Không** lấy tin chưa mua ô vào cho đủ. *Thiếu **công ty** để rải đều là chuyện khác — mục 4*'],
          ['Thứ tự cơ bản', 'Mỗi ô một kiểu — mục 6. Điểm chung: **bậc tin quyết định tin vào được ô nào, không quyết định tin đứng thứ mấy** ở các dải, slide và banner. Riêng **danh sách kết quả tìm kiếm** ở chế độ mặc định *Đề xuất* thì bậc tin xếp trước'],
          ['Vị trí', 'Không bán riêng — không ai mua được chỗ đầu'],
          ['Một công ty giữ mấy thẻ', 'Mỗi ô một luật — mục 4'],
          ['Bao lâu đổi lượt', 'Ô thẻ việc làm: **5 phút** một lượt. Banner theo nhịp riêng của từng ô — mục 5'],
          ['Ai thấy gì', 'Cùng một thời điểm, mọi ứng viên thấy **cùng một danh sách**. Trừ các ô gợi ý theo hồ sơ'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '2. Khách mua gì khi mua một ô' },
      {
        kind: 'table',
        note: 'Hai đường **không giao nhau**: form product chỉ cho tick những ô bán qua bậc tin; ô banner chỉ vào được bằng đơn đặt chỗ.',
        cols: ['', 'Mua qua bậc tin', 'Mua thẳng khung thời gian'],
        rows: [
          ['Khách trả tiền cho', 'Một **bậc tin**, hoặc một **add-on hiển thị**', 'Một **ô banner trong một khoảng ngày**'],
          ['Tin vào ô vì', 'Gói của tin **có tick** ô đó', 'Có một **đơn đặt chỗ đã duyệt** trên ô đó'],
          ['Dùng cho', 'Các dải thẻ việc làm', 'Banner và popup'],
          ['Nhiều khách cùng lúc', 'Bao nhiêu tin mua cũng được — ô chỉ hiện đủ số thẻ của nó, phần còn lại xếp hàng', 'Giới hạn bằng số chỗ đặt cùng lúc của ô'],
        ],
      },
      {
        kind: 'list',
        heading: '2a · Năm điều hay bị hiểu nhầm',
        items: [
          'Mua ô **không phải** mua chỗ. Mua ô là **được vào bể tin** của ô đó rồi chờ tới lượt.',
          'Dải cùng tên ở trang khác là **ô khác**. Dải trên trang chủ và dải cùng tên ở trang Việc làm Hàn Quốc / nước ngoài phải **tick riêng từng ô**.',
          'Một bậc tin thường bán **một dải**. Muốn tin có mặt ở thêm dải thì mua **add-on hiển thị**, không cần đổi bậc.',
          'Có ô chỉ bán **N ngày đầu**. Hết số ngày đó tin rời ô, nhưng tin **vẫn đăng bình thường** ở mọi chỗ khác.',
          'Ở **hai dải trang danh sách việc làm**, khách **không mua thứ hạng** — mọi tin trong dải đều chắc chắn được lên. Bậc tin quyết định tin **vào được ô nào**, chỉ vậy thôi. Còn tin lên **thường xuyên đến đâu** thì tuỳ ô đó đang có bao nhiêu tin: ô đông thì vòng dài, ô vắng thì vòng ngắn. Đó là **tình hình thị trường lúc đó**, không phải thứ bán kèm theo bậc — đừng hứa bậc cao thì tin lên dày hơn. *Một điều phải nói trước với khách đăng nhiều tin:* khi tin của một công ty **vượt 10% cả bể tin** của dải thì mỗi vòng chỉ một phần tin của họ được xếp vào hàng, phần còn lại chờ các vòng sau — mục 4 nói vì sao.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '3. Năm luật đúng với mọi ô' },
      {
        kind: 'list',
        items: [
          '**Tin phải đang hiển thị bình thường**: tin đang mở, đang bật hiển thị, chưa hết hạn. Rớt một điều là không vào ô nào cả.',
          '**Tin phải đã mua đúng ô đó** — qua bậc tin đang chạy, hoặc qua add-on hiển thị. Bậc đang chạy là bậc **cao nhất** tin đang giữ và còn trong hạn. Bậc tin quyết định tin **vào được ô nào**; ở các ô hiển thị — dải, slide, banner — bậc **không** quyết định tin đứng thứ mấy, thứ tự ở đó do luật riêng của từng ô. **Ngoại lệ duy nhất: danh sách kết quả tìm kiếm** ở chế độ mặc định *Đề xuất*, nơi bậc tin xếp trước, rồi tới độ khớp từ khoá và lần làm mới.',
          '**Không lấp chỗ.** Ô thiếu tin thì hiện ít thẻ hơn; dải trên trang chủ không còn tin nào thì trang **ẩn luôn dải**. Không bao giờ lấy tin chưa mua ô vào cho đủ.',
          '**Thứ tự không bốc thăm theo từng người.** Cùng một thời điểm, hai ứng viên mở cùng một trang thấy **cùng một danh sách** — nên khách báo gì cũng tra lại được. Hai dải *Trending · Đừng bỏ lỡ* có xáo ngẫu nhiên, nhưng **xáo một lần cho cả lượt**, không phải mỗi người một kiểu: trong cùng một chu kỳ 5 phút, Sales mở ra thấy y như khách.',
          '**Làm mới tin là cách duy nhất tự đẩy tin lên trước trong hàng** — nhưng chỉ ở những ô xếp hàng theo lần làm mới: Top search, hai dải trang danh sách việc làm, và danh sách kết quả tìm kiếm. Ở **8 dải trang chủ · Hàn Quốc · nước ngoài** thì **không**: mỗi vòng hàng được xếp lại từ đầu, làm mới không đổi được gì. Không phải ngày đăng, và sửa nội dung tin **không** tính. Riêng ở hai dải trang danh sách việc làm, lực đẩy này **có giới hạn**: công ty đang vượt 10% bể tin thì luật rải có thể chưa xếp tin đó vào hàng của vòng này, nên làm mới xong vẫn phải chờ vòng sau — mục 4.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '4. Một công ty được giữ mấy thẻ trong một ô' },
      {
        kind: 'p',
        text: 'Đây là chỗ mỗi ô làm một kiểu. Luật sinh ra để **một công ty nhiều tin không chiếm hết một ô**, nhưng mỗi ô cân giữa *rải đều* và *không để trống* theo một cách khác nhau.',
      },
      {
        kind: 'table',
        note: 'VD luật 10%: dải 30 thẻ → mỗi công ty nhiều nhất **3 thẻ**; dải 40 thẻ → **4 thẻ**. VD Top search: 20 thẻ chia 5 slide → một công ty nhiều nhất **5 thẻ**, mỗi slide một thẻ.\n\nDanh sách kết quả tìm kiếm để mặc định ở *Đề xuất* — bậc tin trước, rồi độ khớp từ khoá, rồi lần làm mới — và ở chế độ đó **không có luật công ty nào**. Cách xếp theo vòng trong bảng là của lựa chọn *Mới nhất*.\n\n**Riêng hai dải trên trang danh sách việc làm, luật đặt ở chỗ khác: ngay khi xếp hàng chờ, hai tin của cùng một công ty đã được rải cách nhau ít nhất 10 chỗ.** Một luật cho hai kết quả — mỗi lượt 30 thẻ thì công ty đó nhiều nhất **3 thẻ** (đúng 10%), **và** không hai thẻ nào của họ đứng cạnh nhau. Thứ tự trên màn hình là **ngẫu nhiên** (mục 3), nhưng chỉ bốc ngẫu nhiên **trong số những cách xếp vẫn giữ được khoảng cách** — không phải xáo bừa rồi sửa lại sau. Hai dải này **không xếp theo bậc tin**: bậc chỉ quyết định tin vào được dải nào, vào rồi thì mọi tin xếp hàng như nhau. Nếu để bậc xếp trước thì tin của một công ty bậc cao bị kéo về sát nhau ở đầu hàng — vẫn đúng 10% số thẻ nhưng phá luật khoảng cách. **Hai con số 10% trên trang này đếm hai thứ khác nhau.** *10% số thẻ* là trần trong một lượt: dải 30 thẻ thì một công ty nhiều nhất 3 thẻ. *10% bể tin* là mốc khác hẳn: công ty giữ quá ngần đó tin thì luật rải không còn xếp hết tin của họ vào hàng của một vòng được nữa, phần còn lại chờ vòng sau. Cùng một luật rải cách nhau 10 chỗ, nhưng đếm trên hai tập khác nhau. Trang *Trending & Đừng bỏ lỡ* nói kỹ.',
        cols: ['Ô hiển thị', 'Một công ty được giữ', 'Khi không đủ công ty để chia'],
        rows: [
          ['**Top search** — đầu trang kết quả tìm kiếm', 'Nhiều nhất **1 thẻ trong mỗi slide 4 thẻ**', 'Rải xa nhất có thể, rồi vẫn lấp cho đủ — không để slide thiếu thẻ'],
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', '**Không có trần.** Tin của một công ty được **rải đều cả hàng**, hai tin cùng công ty không đứng cạnh nhau — nhưng là **cố gắng tối đa**', 'Khi một công ty nắm **hơn nửa** số tin của dải thì không còn cách xếp nào tránh được, và dải chấp nhận hai thẻ đứng cạnh nhau'],
          ['**Trending jobs · Don’t miss these jobs** — các trang danh sách việc làm', 'Hàng chờ đã **rải tin cùng công ty cách nhau 10 chỗ** — nên mỗi lượt công ty đó nhiều nhất **10% số thẻ**, làm tròn xuống và ít nhất 1 thẻ (30 thẻ → 3 thẻ, 40 thẻ → 4 thẻ), và không hai thẻ nào của họ đứng cạnh nhau', 'Dải **hiện ít thẻ hơn**. Trần là luật cứng, không nới ra để lấp cho đầy'],
          ['**Gợi ý nhanh dưới thanh tìm kiếm** và dải **Công ty hàng đầu**', 'Cũng **10% số thẻ** — làm tròn xuống, ít nhất 1 thẻ — **và** hai thẻ đứng cạnh nhau không cùng một công ty khi còn công ty khác để xếp', 'Hết công ty khác thì mới chấp nhận đứng cạnh nhau'],
          ['**Danh sách kết quả tìm kiếm**, sắp xếp *Mới nhất*', 'Không có trần. Xếp **theo vòng**: tin mới nhất trong ngày của **mỗi** công ty trước, hết một lượt mới tới tin thứ hai của từng công ty', 'Không cần — cách xếp này tự cân'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Nhiều nhất **3 tin một công ty**, và hai tin cùng công ty cách nhau **ít nhất 6 vị trí**', 'Hết công ty khác thì vẫn lấp cho đủ thẻ'],
        ],
      },
      {
        kind: 'list',
        heading: '4a · Khi một công ty nắm phần lớn kho tin của ô',
        items: [
          'Với **hầu hết các ô**, luật công ty là **cố gắng tối đa**, không phải lời hứa tuyệt đối: khi một công ty nắm phần lớn số tin đủ điều kiện của ô thì **không có cách xếp nào** vừa giữ được luật vừa không để chỗ trống. *Ngoại lệ là hai dải trên trang danh sách việc làm* — ở đó trần là luật cứng, và dải chấp nhận hiện ít thẻ hơn.',
          'Ở những ô còn lại, ô **giữ đủ thẻ trước**: rải xa nhất có thể, chứ không bỏ bớt tin ra khỏi ô và không để ô thiếu thẻ.',
          '**Vì sao ô có trần thì hứa chắc được, ô không trần thì không:** xếp một dải n thẻ mà không để hai thẻ cùng công ty đứng cạnh nhau là **làm được khi và chỉ khi** công ty đông tin nhất giữ không quá **một nửa** số thẻ. Ô có trần 10% số thẻ thì luôn nằm sâu trong ngưỡng đó nên hứa được; ô không trần thì một công ty có thể vượt nửa, và lúc đó không thuật toán nào cứu được. **Trần chính là thứ làm cho lời hứa “không đứng cạnh nhau” giữ được.**',
          'VD: một slide cần 4 công ty khác nhau, kho chỉ còn 2 công ty → slide vẫn đủ 4 thẻ, và có công ty xuất hiện hai lần.',
          '**Hệ quả phải nói trước với khách:** luật chia lượt **theo công ty**, không theo số tin. Công ty mua **nhiều tin** trong cùng một ô thì **mỗi tin** tới lượt **thưa hơn** tin của công ty chỉ mua một. Mua thêm tin là mua thêm **chỗ trong hàng**, không nhân lên số lượt hiện của từng tin.',
        ],
      },
      {
        kind: 'example',
        heading: 'VD: hai khách cùng nằm trong dải Top search',
        scenario: 'Dải 20 thẻ chia 5 slide, mỗi slide tối đa 1 thẻ của một công ty. Công ty A có 40 tin đủ điều kiện, công ty B có 2 tin.',
        cols: ['', 'Công ty A — 40 tin', 'Công ty B — 2 tin'],
        rows: [
          ['Luật áp vào', 'Mỗi slide nhiều nhất 1 thẻ của A', 'Mỗi slide nhiều nhất 1 thẻ của B'],
          ['Trên một màn hình 20 thẻ', 'Nhiều nhất **5 thẻ**', 'Cả **2 tin** đều có chỗ'],
          ['Mỗi tin tới lượt', '**Thưa** — 40 tin chia nhau 5 chỗ', '**Gần như mọi lượt**'],
        ],
        note: 'Cả hai khách đều được đối xử đúng luật. Nhưng khách A sẽ tự so và thấy mỗi tin của mình ít lượt hơn — nói trước, đừng để khách phát hiện sau.',
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '5. Xoay vòng — bao lâu thì tới lượt tin của khách' },
      {
        kind: 'p',
        text: '**Xoay vòng là gì:** một ô chỉ hiện được vài chục thẻ, nhưng có thể có hàng trăm tin đã mua ô đó. Thay vì luôn hiện mấy tin đầu hàng, ô **đổi sang nhóm tin tiếp theo** sau mỗi nhịp. Đi hết một vòng thì **mọi tin trong hàng đều đã được hiện**. *Riêng hai dải trang danh sách việc làm:* luật rải cách nhau 10 chỗ có thể **chưa xếp hết** tin của một công ty đông tin vào hàng của vòng này — số còn lại vào hàng ở các vòng sau, nên “hàng” và “bể tin” không phải một.',
      },
      {
        kind: 'table',
        cols: ['Ô hiển thị', 'Có xoay vòng', 'Mỗi nhịp đổi gì'],
        rows: [
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Có — **5 phút**', 'Lật sang nhóm tin tiếp theo; lượt cuối thiếu thì lấy thêm từ đầu hàng cho đủ thẻ. Hết vòng thì **xếp lại cả hàng**'],
          ['**Top search**', 'Có — **5 phút**', 'Hàng tịnh tiến **4 tin**: slide 2 lên slide 1, 4 tin kế tiếp vào slide cuối'],
          ['**Banner**', 'Có — theo nhịp đặt trên từng ô', 'Dịch **1 vị trí**: banner thứ hai lên đầu'],
          ['**Trending jobs · Don’t miss these jobs**', 'Có — **5 phút**', 'Đổi **cả cụm thẻ** sang lượt tiếp theo, và **xáo lại thứ tự** bên trong lượt; hết vòng thì xếp lại hàng từ bể tin **tại thời điểm đó**'],
          ['**Danh sách kết quả tìm kiếm**', '**Không**', 'Thứ tự chỉ đổi khi có tin được làm mới, hoặc có tin mới mua ô'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Đổi **mỗi ngày**', 'Mỗi ứng viên một thứ tự riêng, giữ nguyên trong ngày'],
        ],
      },
      {
        kind: 'list',
        items: [
          '**Một vòng dài bao lâu = số tin trong hàng ÷ số tin đổi mỗi nhịp × nhịp.** VD dải 30 thẻ, **hàng** đang có 80 tin → 3 nhịp là hết một vòng, tức **15 phút**. Ở hai dải trang danh sách việc làm, khi có công ty vượt 10% bể tin thì **“số tin trong hàng” ít hơn cả bể** — tin chưa vào được hàng thì chưa tính vào vòng này. **Đừng thay số của cả bể tin vào công thức** — làm vậy ra vòng dài hơn thực tế. Thực tế là **vòng ngắn lại** cho mọi người, còn tin của chính công ty vượt trần thì **lên thưa hơn**: hai điều này đúng cùng một lúc.',
          'Ô càng bán được nhiều tin thì vòng càng dài. Đây là câu trả lời thật cho *“bao lâu tin tôi được hiện”*: **mỗi vòng một lần**, chứ không phải lúc nào cũng có mặt — trừ tin của công ty đang vượt 10% bể tin ở hai dải trang danh sách việc làm: tin của họ lên **thưa hơn hẳn**, và **đừng nói với khách một con số** — chờ bao nhiêu vòng còn tuỳ cách hệ thống xếp hàng, chênh nhau vài lần.',
          'Nhịp đặt trên **từng ô**, người vận hành sửa được, không cần dev.',
          'Ô **không xoay vòng** thì tin nằm ngoài số thẻ đầu hàng **không được hiện** cho tới khi hàng đổi — hàng chỉ đổi khi có tin được làm mới hoặc có tin mới mua ô.',
          'Top search **chốt hàng ở đầu mỗi vòng**: tin đăng hoặc làm mới giữa vòng vào hàng từ **vòng sau**, để tin đang chờ không bị cướp lượt.',
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '6. Giống nhau chỗ nào, khác nhau chỗ nào' },
      {
        kind: 'table',
        note: '**Giống nhau:** điều kiện tin được hiển thị, cách tin vào ô, không lấp chỗ, và cùng một thời điểm mọi người thấy như nhau. **Khác nhau** đúng bốn cột bên phải — và gần hết câu hỏi *“sao tin này không hiện”* nằm ở một trong bốn cột đó.',
        cols: ['Ô hiển thị', 'Lấy tin từ đâu', 'Đọc từ khoá ứng viên gõ', 'Thứ tự', 'Xoay vòng'],
        rows: [
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Kho tin đã mua đúng ô đó', 'Không', 'Rải đều theo công ty, xếp lại mỗi vòng — **làm mới không đổi được thứ tự**', 'Có'],
          ['**Top search**', 'Ô tìm kiếm, lọc trong các tin đã mua ô', '**Có**', 'Làm mới gần nhất', 'Có'],
          ['**Trending jobs · Don’t miss these jobs**', 'Ô tìm kiếm của trang danh sách việc làm', '**Có** — theo trang đang mở', 'Hàng gom theo nhóm của trang, trong nhóm theo lần làm mới, rồi **rải tin cùng công ty cách nhau 10 chỗ** — nên mỗi lượt 30 thẻ không công ty nào quá 3 thẻ. Lên màn hình thì **xáo ngẫu nhiên** trong lượt. **Bậc tin không xếp thứ tự**', 'Có'],
          ['**Danh sách kết quả tìm kiếm**', 'Toàn bộ tin đang mở, lọc theo từ khoá và bộ lọc', '**Có**', 'Mặc định *Đề xuất*: **bậc tin trước**, rồi độ khớp từ khoá, rồi làm mới. Chọn *Mới nhất* thì xếp theo vòng công ty', 'Không'],
          ['**Banner · popup**', 'Đơn đặt chỗ đã duyệt', 'Không', 'Theo nhịp của ô', 'Có'],
          ['**Việc làm gợi ý theo hồ sơ** *(không bán)*', 'Toàn bộ tin đang mở, chấm theo hồ sơ ứng viên', 'Không', 'Điểm phù hợp', 'Đổi mỗi ngày'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '7. Tra cứu nhanh: tin của khách đang ở đâu' },
      {
        kind: 'p',
        text: '**Product settings → Placement load** trong Admin dựng lại từng ô đúng như site đang hiện, rồi xếp mọi tin đủ điều kiện vào bốn nhóm. Đây là chỗ nhanh nhất để trả lời khách.',
      },
      {
        kind: 'table',
        note: 'Số liệu ở đây dựng theo **một lượt xem không từ khoá, không bộ lọc**. Với các ô có đọc từ khoá, đó là **trần trên**: một lượt tìm kiếm thật bao giờ cũng ít tin tranh nhau hơn.',
        cols: ['Nhóm', 'Nghĩa', 'Nói với khách'],
        rows: [
          ['**Showing now**', 'Ô đang hiện tin này ngay lúc này', '*Tin đang hiện*'],
          ['**Waiting for a turn**', 'Tin sẽ tới lượt ở một nhịp sau', '*Tin đang trong hàng, tới lượt trong vòng này* — **trừ** tin của công ty đang vượt 10% bể tin ở hai dải trang danh sách việc làm: tin đó có thể phải chờ sang vòng sau, **đừng hẹn khách trong vòng này** (mục 4)'],
          ['**Never shown**', 'Tin đủ điều kiện nhưng hết cả một vòng vẫn không tới lượt', 'Nhóm này **phải trống** ở gần hết các ô — **trừ một trường hợp**: ở hai dải trang danh sách việc làm, tin của công ty đang giữ **hơn 10% bể tin** của dải lên **thưa hơn hẳn** — có thể nhiều vòng mới tới lượt, và **đừng đoán ra một con số** cho khách. Đó là **chủ ý của luật rải**, không phải lỗi (mục 4). Ngoài trường hợp đó, thấy tin nằm đây thì **báo lại**, đừng giải thích với khách là bình thường. Câu hỏi đúng bây giờ không còn là *“tin có được hiện không”* mà là ***“bao lâu một lần”*** — mục 5'],
          ['**Empty slot**', 'Ô còn chỗ trống vì chưa đủ tin', '*Ô này còn chỗ bán*'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '8. Bán được gì, và không hứa gì' },
      {
        kind: 'table',
        cols: ['Hứa được', 'Không hứa'],
        rows: [
          ['Tin sẽ vào **bể tin** của đúng ô đã mua', 'Tin luôn nằm ở thẻ đầu, hay ở slide 1 — và **không có cách trả thêm tiền để chen lên trước** trong cùng một ô'],
          ['Mỗi vòng tin **lên đúng một lần** — kể cả tin ở bậc thấp nhất của ô. *Trừ* công ty đang vượt 10% bể tin ở hai dải trang danh sách việc làm: tin của họ phải chờ qua vòng (mục 4)', 'Tin lúc nào cũng có mặt trên màn hình'],
          ['Tính trước được **bao lâu tin lên một lần** ở các ô **không có trần công ty**: bể càng đông thì vòng càng dài', 'Bậc cao hơn thì hiện **dày hơn** — trong cùng một ô, bậc không đổi được tần suất'],
          ['Hai dải trang danh sách việc làm: trong một lượt **không công ty nào quá 10% số thẻ**', 'Một vị trí cụ thể trong dải — và với công ty vượt 10% bể tin, **một con số cho câu “bao lâu tin tôi lên một lần”**'],
          ['Bậc cao hơn **xếp trước** ở danh sách kết quả tìm kiếm, chế độ mặc định *Đề xuất*', 'Bậc cao hơn xếp trước **ở các dải** — ở đó bậc chỉ quyết định vào được dải nào'],
          ['Cùng một thời điểm, mọi ứng viên thấy như nhau', 'Thứ tự riêng cho từng ứng viên'],
          ['Làm mới tin **rút ngắn thời gian chờ** tới lượt ở Top search, hai dải trang danh sách việc làm và danh sách kết quả tìm kiếm — ở hai dải, chỉ khi tin đã được xếp vào hàng của vòng này (mục 3)', 'Làm mới đẩy được tin lên đầu **8 dải trang chủ · Hàn Quốc · nước ngoài** — hoặc cho tin lên hai lần trong một vòng'],
          ['Mua add-on hiển thị để có mặt ở thêm ô', 'Mua nhiều tin thì mỗi tin được hiện nhiều hơn'],
          ['Số thẻ và nhịp của ô sửa được, không cần dev', 'Tin lên ô ngay khi ký — phải **đăng tin** trước'],
        ],
      },

      /* ───────────────────────────────────────────────────────────────── */
      { kind: 'h', text: '9. Các trang trong nhóm này' },
      {
        kind: 'table',
        note: 'Trang này nói phần **chung cho mọi ô**. Mỗi trang bên dưới nói cách một ô **chọn và xếp tin** của riêng nó.',
        cols: ['Ô', 'Ở đâu trên site', 'Trang riêng'],
        rows: [
          ['**Top search**', 'Dải thẻ trên đầu trang kết quả tìm kiếm', '`/trang/top-search`'],
          ['**8 dải trang chủ · Hàn Quốc · nước ngoài**', 'Việc làm Premium · Top Việc Làm Hấp Dẫn · Việc làm Tiêu Điểm · Việc Làm Mới Nhất · Mạng Lưới Việc Làm …', '`/trang/home-job-bands`'],
          ['**Trending jobs · Don’t miss these jobs**', 'Hai dải trên các trang danh sách việc làm trong mega menu', '`/trang/board-strips`'],
          ['**Banner và popup**', 'Trang chủ, trang công ty, trang cá nhân, trang đăng nhập', '*xem nhóm Content*'],
        ],
      },

      { kind: 'p', text: `*${STAMP_GROUP}*` },
    ],
  },
}
