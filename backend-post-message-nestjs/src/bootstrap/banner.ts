import { row, WIDTH } from 'src/app/core/constants/banner.constants';
import { BannerOptions } from 'src/app/core/interfaces/banner.interface';

export const printBanner = ({
  name,
  env,
  url,
  docs,
  dbOk,
  storageUrl,
  storageOk,
  testing,
}: BannerOptions) => {
  const bar = '─'.repeat(WIDTH);
  const title = `  ${name}`.padEnd(WIDTH);

  console.log(`\n┌${bar}┐`);
  console.log(`│${title}│`);
  console.log(`├${bar}┤`);
  console.log(row('Env', env));
  console.log(row('URL', url));
  if (docs) console.log(row('Docs', docs));
  console.log(row('Database', dbOk ? '✔  connected' : '✘  unreachable'));
  console.log(
    row('Storage', storageOk ? `✔  ${storageUrl}` : '✘  unreachable'),
  );
  console.log(row('Testing', testing ? '✔  enabled' : '✘  disabled'));
  console.log(`└${bar}┘\n`);
};
