export const lookup = jest.fn();
lookup.mockImplementation((ip: string) => {
  const ipMocks: Record<string, any> = {
    '8.8.8.8': { country: 'US', region: 'CA', city: 'Mountain View' },
    '8.8.4.4': { country: 'GB', region: 'ENG', city: 'London' },
    '1.1.1.1': { country: 'AU', region: 'QLD', city: 'Brisbane' },
    '208.67.222.222': { country: 'CA', region: 'ON', city: 'Toronto' },
  };

  return ipMocks[ip] || null;
});
