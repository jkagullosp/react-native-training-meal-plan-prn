import { authApi } from '@/api/authApi';
import { ApiError } from '@/api/apiHelpers';

type ChainResp = { data: any; error: any };

function createChain(singleResp: ChainResp = { data: null, error: null }) {
  const c: any = {};
  const methods = [
    'select',
    'eq',
    'order',
    'insert',
    'update',
    'delete',
    'in',
    'limit',
    'gte',
  ];
  methods.forEach(m => (c[m] = jest.fn().mockReturnValue(c)));
  c.single = jest.fn().mockResolvedValue(singleResp);
  c.maybeSingle = jest.fn().mockResolvedValue(singleResp);
  // ensure chaining + awaitable behavior if code ever awaits the chain
  c.then = jest.fn().mockImplementation(async (onFulfilled: any) => {
    try {
      onFulfilled({
        data: singleResp.data ? [singleResp.data] : [],
        error: null,
      });
    } catch {
      /* noop */
    }
    return Promise.resolve();
  });
  return c;
}

describe('AuthApi', () => {
  let supabase: any;
  let chainMap: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    supabase = require('@/client/supabase').supabase;

    // create per-table chain mocks
    chainMap = {
      profiles: createChain({ data: null, error: null }),
      default: createChain({ data: null, error: null }),
    };

    // override from to return per-table chain
    supabase.from = jest.fn(
      (table: string) => chainMap[table] || chainMap.default,
    );

    // ensure auth methods are mocked per test
    supabase.auth = {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    };
  });

  it('signIn returns user and session on success', async () => {
    const fakeUser = { id: 'u1' };
    const fakeSession = { access_token: 't' };
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: fakeUser, session: fakeSession },
      error: null,
    });

    const res = await authApi.signIn('a@b.com', 'pw');
    expect(res.user).toEqual(fakeUser);
    expect(res.session).toEqual(fakeSession);
  });

  it('signIn throws ApiError and shows toast on failure', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: new Error('bad creds'),
    });

    await expect(authApi.signIn('a@b.com', 'pw')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('signUp returns user on success and throws on failure', async () => {
    const fakeUser = { id: 'u2' };
    supabase.auth.signUp.mockResolvedValue({
      data: { user: fakeUser },
      error: null,
    });

    const res = await authApi.signUp({
      email: 'x@x.com',
      password: 'pw',
      display_name: 'n',
      username: 'u',
    } as any);
    expect(res).toEqual(fakeUser);

    supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: new Error('fail'),
    });
    await expect(
      authApi.signUp({
        email: 'x',
        password: 'p',
        display_name: '',
        username: '',
      } as any),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('signOut resolves on success and throws on error', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });
    await expect(authApi.signOut()).resolves.toBeUndefined();

    supabase.auth.signOut.mockResolvedValue({ error: new Error('nope') });
    await expect(authApi.signOut()).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('getSession returns session when provided', async () => {
    const session = { id: 's1' };
    supabase.auth.getSession.mockResolvedValue({
      data: { session },
      error: null,
    });

    const res = await authApi.getSession();
    expect(res).toEqual(session);
  });

  it('getCurrentUser returns user when provided', async () => {
    const user = { id: 'u3' };
    supabase.auth.getUser.mockResolvedValue({ data: { user }, error: null });

    const res = await authApi.getCurrentUser();
    expect(res).toEqual(user);
  });

  it('getProfile queries profiles table and returns profile on success', async () => {
    const profile = {
      id: 'p1',
      display_name: 'n',
      username: 'u',
      email: 'e',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    };
    chainMap.profiles.maybeSingle.mockResolvedValue({
      data: profile,
      error: null,
    });

    const res = await authApi.getProfile('p1');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(chainMap.profiles.select).toHaveBeenCalledWith('*');
    expect(chainMap.profiles.eq).toHaveBeenCalledWith('id', 'p1');
    expect(res).toEqual(profile);
  });

  it('getProfile throws ApiError and shows toast on db error', async () => {
    chainMap.profiles.maybeSingle.mockResolvedValue({
      data: null,
      error: new Error('db'),
    });
    await expect(authApi.getProfile('pX')).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });
});
