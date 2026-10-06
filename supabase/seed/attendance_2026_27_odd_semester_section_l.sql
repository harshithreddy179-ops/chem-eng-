-- ════════════════════════════════════════════════════════════════════════════
--  Attendance data — Odd Semester 2026–27
--  Chemical Engineering, First Semester, Section L (MNNIT Allahabad)
--
--  Transcribed from:
--    • "Time Table [Odd Semester 2026-27] — Chemical Engineering First Semester (Section L)"
--    • "ODD Semester (2026-27) Academic Calendar for All Students"
--
--  Everything here can be edited afterwards in Admin → Attendance.
--  Re-running this file replaces this one semester's data (matched by name,
--  year and group label); nothing else is touched.
--
--  Not decided here (left for the admin, because the documents don't say):
--    • which weekday's timetable runs on the "First Year Classes" Saturdays —
--      they are added as working days with the timetable "to be announced";
--    • the 2nd short attendance notification (3 Nov) as a starting point —
--      add it as a checkpoint once you know when counting resumes after it.
-- ════════════════════════════════════════════════════════════════════════════

do $$
declare
  sem uuid;
  c_chem uuid; c_math uuid; c_hsn uuid; c_cpp uuid; c_thermo uuid; c_eg uuid; c_env uuid;
begin
  delete from public.attendance_semesters
   where name = 'Semester 1' and academic_year = '2026–27'
     and group_label = 'Chemical Engineering · Section L';

  insert into public.attendance_semesters
    (section_id, name, academic_year, group_label, start_date, end_date, batches, target_percent, display_order)
  values (
    (select id from public.academic_sections where slug = 'semester-1'),
    'Semester 1', '2026–27', 'Chemical Engineering · Section L',
    '2026-07-20',   -- Start of Classes [Odd Semester]
    '2026-11-14',   -- End of Classes is Fri 13 Nov; Sat 14 Nov is marked "First Year Classes"
    array['L1','L2'], 85, 1)
  returning id into sem;

  -- ─── Courses (codes and names exactly as on the timetable) ──────────────
  insert into public.attendance_courses (semester_id, code, name, subject_id, display_order) values
    (sem, 'MAN11101', 'Mathematics 1', (select id from public.subjects where slug = 'mathematics'), 1)
    returning id into c_math;
  insert into public.attendance_courses (semester_id, code, name, subject_id, display_order) values
    (sem, 'CYN11502', 'Chemistry 3', (select id from public.subjects where slug = 'chemistry'), 2)
    returning id into c_chem;
  insert into public.attendance_courses (semester_id, code, name, subject_id, display_order) values
    (sem, 'CHN11101', 'Chemical Process Principles', (select id from public.subjects where slug = 'chemical-process-principles'), 3)
    returning id into c_cpp;
  insert into public.attendance_courses (semester_id, code, name, subject_id, display_order) values
    (sem, 'CHN11102', 'Engineering Thermodynamics', (select id from public.subjects where slug = 'engineering-thermodynamics'), 4)
    returning id into c_thermo;
  insert into public.attendance_courses (semester_id, code, name, subject_id, display_order) values
    (sem, 'HSN11600', 'Professional Communication', (select id from public.subjects where slug = 'professional-communication'), 5)
    returning id into c_hsn;
  insert into public.attendance_courses (semester_id, code, name, subject_id, display_order) values
    (sem, 'IDN11600', 'Introduction to Environment and Climate Change', (select id from public.subjects where slug = 'environment-climate'), 6)
    returning id into c_env;
  insert into public.attendance_courses (semester_id, code, name, subject_id, display_order) values
    (sem, 'MEN11601', 'Engineering Graphics', null, 7)
    returning id into c_eg;

  -- ─── Weekly timetable (1 = Monday … 5 = Friday). One row per timetable cell.
  insert into public.attendance_schedule (semester_id, course_id, day_of_week, start_time, end_time, class_type, room, batch) values
    -- Monday
    (sem, c_cpp,    1, '15:00', '16:00', 'lecture',  'FEW15', null),
    (sem, c_cpp,    1, '16:00', '17:00', 'lecture',  'FEW15', null),
    (sem, c_math,   1, '17:00', '18:00', 'lecture',  'FEW15', null),
    -- Tuesday
    (sem, c_math,   2, '10:00', '11:00', 'lecture',  'SEW10', null),
    (sem, c_eg,     2, '11:00', '12:00', 'lab',      'SEW8',  'L1'),
    (sem, c_eg,     2, '12:00', '13:00', 'lab',      'SEW8',  'L1'),
    (sem, c_hsn,    2, '16:00', '17:00', 'lecture',  'NLH2',  null),
    (sem, c_env,    2, '17:00', '18:00', 'lecture',  'NLH2',  null),
    -- Wednesday
    (sem, c_cpp,    3, '09:00', '10:00', 'lecture',  'FE18',  null),
    (sem, c_math,   3, '10:00', '11:00', 'lecture',  'FE18',  null),
    (sem, c_eg,     3, '14:00', '15:00', 'lecture',  'SEW8',  null),
    (sem, c_hsn,    3, '15:00', '16:00', 'lab',      null,    null),
    (sem, c_hsn,    3, '16:00', '17:00', 'lab',      null,    null),
    (sem, c_chem,   3, '17:00', '18:00', 'tutorial', 'NLH2',  null),
    -- Thursday
    (sem, c_eg,     4, '09:00', '10:00', 'lab',      'SEW8',  'L2'),
    (sem, c_eg,     4, '10:00', '11:00', 'lab',      'SEW8',  'L2'),
    (sem, c_thermo, 4, '11:00', '12:00', 'lecture',  'FC5',   null),
    (sem, c_thermo, 4, '12:00', '13:00', 'tutorial', 'FC5',   null),
    (sem, c_chem,   4, '15:00', '16:00', 'lecture',  'NLH2',  null),
    (sem, c_math,   4, '16:00', '17:00', 'tutorial', 'SEW1',  null),
    -- Friday
    (sem, c_chem,   5, '09:00', '10:00', 'lab',      null,    null),
    (sem, c_chem,   5, '10:00', '11:00', 'lab',      null,    null),
    (sem, c_thermo, 5, '11:00', '12:00', 'lecture',  'FC5',   null),
    (sem, c_chem,   5, '12:00', '13:00', 'lecture',  'NLH2',  null),
    (sem, c_env,    5, '14:00', '15:00', 'lecture',  'NLH1',  null),
    (sem, c_hsn,    5, '15:00', '16:00', 'lecture',  'NLH1',  null);

  -- ─── Holidays (red in the academic calendar) and the mid-semester break ──
  insert into public.attendance_holidays (semester_id, date, name) values
    (sem, '2026-08-15', 'Independence Day'),
    (sem, '2026-08-26', 'Id-e-Milad'),
    (sem, '2026-09-04', 'Janmashtami'),
    (sem, '2026-10-02', 'Gandhi Jayanti'),
    (sem, '2026-10-17', 'Mid-Semester Break'),
    (sem, '2026-10-18', 'Mid-Semester Break'),
    (sem, '2026-10-19', 'Mid-Semester Break'),
    (sem, '2026-10-20', 'Dussehra · Mid-Semester Break'),
    (sem, '2026-10-21', 'Mid-Semester Break'),
    (sem, '2026-10-22', 'Mid-Semester Break'),
    (sem, '2026-10-23', 'Mid-Semester Break'),
    (sem, '2026-10-24', 'Mid-Semester Break'),
    (sem, '2026-10-25', 'Mid-Semester Break'),
    (sem, '2026-11-08', 'Diwali');

  -- ─── "First Year Classes" Saturdays: working days, timetable to be set ───
  insert into public.attendance_overrides (semester_id, date, action, follow_weekday, notes) values
    (sem, '2026-08-08', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-08-22', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-08-29', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-09-05', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-09-12', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-09-19', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-09-26', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-10-03', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-10-31', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-11-07', 'follow_weekday', null, 'First Year Classes'),
    (sem, '2026-11-14', 'follow_weekday', null, 'First Year Classes');

  -- ─── Starting point: the 1st short attendance notification ───────────────
  -- Students enter the figures from this notice; the calendar takes over
  -- from the first class day after the mid-semester break.
  insert into public.attendance_checkpoints (semester_id, label, as_of_date, resume_date) values
    (sem, '1st Short Attendance Notification', '2026-10-08', '2026-10-26');
end $$;
