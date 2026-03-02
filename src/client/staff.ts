import { QUERY_STAFF_BY_ID, QUERY_STAFF_BY_ID_WITH_MEDIA, QUERY_STAFF_SEARCH } from "../queries";

import type { PagedResult, SearchStaffOptions, Staff, StaffIncludeOptions } from "../types";

import { clampPerPage, validateId } from "../utils";
import type { ClientBase } from "./base";

export async function getStaff(client: ClientBase, id: number, include?: StaffIncludeOptions): Promise<Staff> {
  validateId(id, "staffId");
  if (include?.media) {
    const perPage = typeof include.media === "object" ? (include.media.perPage ?? 25) : 25;
    const data = await client.request<{ Staff: Staff }>(QUERY_STAFF_BY_ID_WITH_MEDIA, { id, perPage });
    return data.Staff;
  }
  const data = await client.request<{ Staff: Staff }>(QUERY_STAFF_BY_ID, { id });
  return data.Staff;
}

export async function searchStaff(client: ClientBase, options: SearchStaffOptions = {}): Promise<PagedResult<Staff>> {
  const { query: search, page = 1, perPage = 20, sort } = options;
  return client.pagedRequest<Staff>(
    QUERY_STAFF_SEARCH,
    { search, sort, page, perPage: clampPerPage(perPage) },
    "staff",
  );
}
