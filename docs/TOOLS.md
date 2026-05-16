# ynabro Tools Reference

This document describes the public tools exposed by `ynabro` for use by agents and LLMs.

## YnabroClient

The core client class.

### Constructor

```ts
new YnabroClient(token: string)
```

Creates a new client. Throws if `token` is empty.

## Tools

### getPendingTransactions

```ts
getPendingTransactions(client: YnabroClient, planId: string): Promise<YnabTransaction[]>
```

Returns all unapproved transactions for the given plan.

### getRecentTransactions

```ts
getRecentTransactions(client: YnabroClient, planId: string): Promise<YnabTransaction[]>
```

Returns recent transactions (both approved and pending).

### approveTransaction

```ts
approveTransaction(client: YnabroClient, planId: string, transactionId: string): Promise<void>
```

Approves a specific transaction.

### getPlanInfo

```ts
getPlanInfo(client: YnabroClient, planId: string): Promise<YnabPlan | undefined>
```

Returns basic information about a plan by ID.
