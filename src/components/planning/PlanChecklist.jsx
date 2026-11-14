export default function PlanChecklist({
    requirements = [],
    warnings = [],
}) {
    const warningGroups = new Set(
        warnings
            .map((warning) => warning.group)
            .filter(Boolean)
    );

    const groups = requirements.reduce((result, requirement) => {
        const groupName = requirement.group ?? 'Requirements';

        if (!result[groupName]) {
            result[groupName] = [];
        }

        result[groupName].push(requirement);
        return result;
    }, {});

    return (
        <section
            className="plan-checklist"
            aria-labelledby="plan-checklist-title"
        >
            <div className="plan-checklist__heading">
                <div>
                    <h2 id="plan-checklist-title">
                        Degree requirements
                    </h2>

                    <p>
                        Your checklist updates as you build your plan.
                    </p>
                </div>

                <div className="plan-checklist__legend">
                    <span>
                        <i className="plan-checklist__dot plan-checklist__dot--met" />
                        Met
                    </span>

                    <span>
                        <i className="plan-checklist__dot plan-checklist__dot--attention" />
                        Needs attention
                    </span>

                    <span>
                        <i className="plan-checklist__dot plan-checklist__dot--pending" />
                        Not met
                    </span>
                </div>
            </div>

            <div className="plan-checklist__grid">
                {Object.entries(groups).map(([groupName, items]) => {
                    const allMet = items.every((item) => item.met);
                    const hasWarning = warningGroups.has(groupName);

                    let state = 'pending';

                    if (allMet) {
                        state = 'met';
                    }

                    if (hasWarning) {
                        state = 'attention';
                    }

                    const completed = items.filter(
                        (item) => item.met
                    ).length;

                    return (
                        <article
                            key={groupName}
                            className={
                                `plan-rule-card ` +
                                `plan-rule-card--${state}`
                            }
                        >
                            <div className="plan-rule-card__top">
                                <h3>{groupName}</h3>

                                <span
                                    className={
                                        `plan-rule-card__state ` +
                                        `plan-rule-card__state--${state}`
                                    }
                                >
                                    {state === 'met' && 'Met'}
                                    {state === 'attention' &&
                                        'Needs attention'}
                                    {state === 'pending' &&
                                        'Not met'}
                                </span>
                            </div>

                            <p className="plan-rule-card__progress">
                                {completed} of {items.length} requirements met
                            </p>

                            <ul className="plan-rule-card__items">
                                {items.map((item) => (
                                    <li
                                        key={item.id}
                                        className={
                                            item.met
                                                ? 'is-met'
                                                : ''
                                        }
                                    >
                                        <span
                                            className="plan-rule-card__check"
                                            aria-hidden="true"
                                        >
                                            {item.met ? '✓' : '○'}
                                        </span>

                                        <span>{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}