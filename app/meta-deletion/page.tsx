// Public status page for Meta's Data Deletion Callback. Deletion runs
// synchronously when Meta calls us, so any code shown here is already done.
export default async function MetaDeletionStatus({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-20 sm:px-8">
      <h1 className="font-display text-3xl tracking-tight">Data deletion status</h1>
      <p className="mt-4 text-ink-200">
        Andromeda has deleted the Meta access tokens connected by your Facebook
        account. Analyses created by your workspaces are not Meta data and stay
        with those workspaces.
      </p>
      {code ? (
        <p className="mt-4 text-sm text-ink-300">
          Confirmation code: <code className="font-code">{code}</code> — completed.
        </p>
      ) : null}
    </main>
  );
}
