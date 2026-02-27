/**
 * draw2agent — Browser launcher utility
 */
import open from 'open';

export async function openBrowser(url: string): Promise<void> {
  await open(url);
}
