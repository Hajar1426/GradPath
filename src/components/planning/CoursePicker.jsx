import { useState } from 'react';

import Modal from '../common/Modal';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

import { PUBLISH_STATUS } from '../../data/statusValues';

export default function CoursePicker({
    open,
    term,
    courses = [],
    offerings = [],
    plannedTerms = [],
    onClose,
    onAdd,
}) {
    const [search, setSearch] = useState('');
    const [area, setArea] = useState('all');

    // The picker has nothing to display until a term is selected.
    if (!term) {
        return null;
    }

    const historical = term.type === 'historical';

    // ---------------------------------------------------------
    // COURSES ALREADY USED IN THE PLAN
    // ---------------------------------------------------------

    const coursesAlreadyInPlan = new Set(
        plannedTerms.flatMap(
            (planTerm) => planTerm.courses ?? []
        )
    );

    // ---------------------------------------------------------
    // PUBLISHED OFFERINGS FOR THE SELECTED TERM
    // ---------------------------------------------------------

    const publishedOfferings = offerings.filter(
        (offering) =>
            offering.term === term.term &&
            offering.status === PUBLISH_STATUS.PUBLISHED
    );

    const offeredCodes = new Set(
        publishedOfferings.map(
            (offering) => offering.courseCode
        )
    );

    // ---------------------------------------------------------
    // SEARCH + AREA FILTER
    // ---------------------------------------------------------

    const normalizedSearch = search
        .trim()
        .toLowerCase();

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            !normalizedSearch ||
            course.code
                .toLowerCase()
                .includes(normalizedSearch) ||
            course.title
                .toLowerCase()
                .includes(normalizedSearch);

        const matchesArea =
            area === 'all' ||
            course.area === area;

        return matchesSearch && matchesArea;
    });

    // ---------------------------------------------------------
    // UI
    // ---------------------------------------------------------

    return (
        <Modal
            open={open}
            title={
                historical
                    ? `Add previous course — Term ${term.term}`
                    : `Add course — Term ${term.term}`
            }
            onClose={onClose}
        >
            <div className="course-picker">
                <p className="course-picker__intro">
                    {historical
                        ? 'Add a course you successfully completed in this term.'
                        : 'Choose a course to include in your academic plan.'}
                </p>

                <div className="course-picker__filters">
                    <Input
                        label="Search"
                        value={search}
                        placeholder="Course code or title"
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                    />

                    <Select
                        label="Area"
                        value={area}
                        onChange={(event) =>
                            setArea(event.target.value)
                        }
                        options={[
                            {
                                value: 'all',
                                label: 'All areas',
                            },
                            {
                                value: 'A',
                                label: 'Area A',
                            },
                            {
                                value: 'B',
                                label: 'Area B',
                            },
                            {
                                value: 'C',
                                label: 'Area C',
                            },
                            {
                                value: 'D',
                                label: 'Area D',
                            },
                        ]}
                    />
                </div>

                <div className="course-picker__list">
                    {filteredCourses.map((course) => {
                        const alreadyAdded =
                            coursesAlreadyInPlan.has(
                                course.code
                            );

                        const offered =
                            historical ||
                            offeredCodes.has(course.code);

                        const offering =
                            publishedOfferings.find(
                                (item) =>
                                    item.courseCode ===
                                    course.code
                            );

                        return (
                            <article
                                key={course.code}
                                className="course-picker__course"
                            >
                                <div className="course-picker__course-info">
                                    <div className="course-picker__course-heading">
                                        <strong>
                                            {course.code}
                                        </strong>

                                        {course.area && (
                                            <span>
                                                Area {course.area}
                                            </span>
                                        )}
                                    </div>

                                    <p>{course.title}</p>

                                    <div className="course-picker__meta">
                                        <span>
                                            {course.credits}{' '}
                                            {course.credits === 1
                                                ? 'credit'
                                                : 'credits'}
                                        </span>

                                        {!historical &&
                                            offering && (
                                                <span>
                                                    {offering.days}
                                                    {' • '}
                                                    {offering.time}
                                                </span>
                                            )}
                                    </div>

                                    {!historical &&
                                        !offered && (
                                            <p className="course-picker__warning">
                                                Not listed in the
                                                published offerings
                                                for Term {term.term}.
                                            </p>
                                        )}

                                    {course.prerequisiteText && (
                                        <p className="course-picker__prerequisite">
                                            Prerequisite:{' '}
                                            {
                                                course.prerequisiteText
                                            }
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant={
                                        offered
                                            ? 'primary'
                                            : 'ghost'
                                    }
                                    disabled={alreadyAdded}
                                    onClick={() =>
                                        onAdd(
                                            term.term,
                                            course.code
                                        )
                                    }
                                >
                                    {alreadyAdded
                                        ? 'Already in plan'
                                        : historical
                                          ? 'Add previous'
                                          : 'Add to plan'}
                                </Button>
                            </article>
                        );
                    })}

                    {filteredCourses.length === 0 && (
                        <p className="course-picker__empty">
                            No courses match your search.
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
}