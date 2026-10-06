"use client";

import { useSyncExternalStore } from "react";
import {
  emptySemesterState,
  getAttendanceServerSnapshot,
  getAttendanceSnapshot,
  subscribeAttendance,
} from "@/lib/attendance/store";
import type { StudentSemesterState } from "@/types/attendance";

export function useStudentSemester(semesterId: string | undefined): StudentSemesterState {
  const all = useSyncExternalStore(subscribeAttendance, getAttendanceSnapshot, getAttendanceServerSnapshot);
  return (semesterId && all[semesterId]) || EMPTY_STATE;
}

const EMPTY_STATE = emptySemesterState();
