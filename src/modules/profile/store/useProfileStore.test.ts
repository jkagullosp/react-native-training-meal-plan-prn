import { useProfileStore } from './useProfileStore';
import { supabase } from '../../utils/supabase';

jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      updateUser: jest.fn(),
    },
  },
}));

beforeEach(() => {
  useProfileStore.setState({
    user: null,
    loading: false,
    error: null,
    fetchProfile: useProfileStore.getState().fetchProfile,
    updateProfileImage: useProfileStore.getState().updateProfileImage,
    updateDisplayName: useProfileStore.getState().updateDisplayName,
    updateUsername: useProfileStore.getState().updateUsername,
    updateBio: useProfileStore.getState().updateBio,
    changePassword: useProfileStore.getState().changePassword,
  }, true);
});

describe('useProfileStore', () => {
  it('fetches profile successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'u1', display_name: 'Test User', username: 'testuser', email: 'test@example.com', profile_image: null, bio: null, created_at: '', updated_at: '' },
            error: null,
          }),
        }),
      }),
    });

    await useProfileStore.getState().fetchProfile('u1');
    expect(useProfileStore.getState().user?.display_name).toBe('Test User');
    expect(useProfileStore.getState().loading).toBe(false);
    expect(useProfileStore.getState().error).toBeNull();
  });

  it('handles error in fetchProfile', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Fetch error' },
          }),
        }),
      }),
    });

    await useProfileStore.getState().fetchProfile('u1');
    expect(useProfileStore.getState().user).toBeNull();
    expect(useProfileStore.getState().loading).toBe(false);
    expect(useProfileStore.getState().error).toBe('Fetch error');
  });

  it('updates profile image successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    const result = await useProfileStore.getState().updateProfileImage('u1', 'img.jpg');
    expect(result).toBe(true);
    expect(useProfileStore.getState().loading).toBe(false);
    expect(useProfileStore.getState().error).toBeNull();
  });

  it('handles error in updateProfileImage', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'Update error' } }),
      }),
    });

    const result = await useProfileStore.getState().updateProfileImage('u1', 'img.jpg');
    expect(result).toBe(false);
    expect(useProfileStore.getState().error).toBe('Update error');
  });

  it('updates display name successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    const result = await useProfileStore.getState().updateDisplayName('u1', 'New Name');
    expect(result).toBe(true);
    expect(useProfileStore.getState().error).toBeNull();
  });

  it('handles error in updateDisplayName', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'Display error' } }),
      }),
    });

    const result = await useProfileStore.getState().updateDisplayName('u1', 'New Name');
    expect(result).toBe(false);
    expect(useProfileStore.getState().error).toBe('Display error');
  });

  it('updates username successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    const result = await useProfileStore.getState().updateUsername('u1', 'newusername');
    expect(result).toBe(true);
    expect(useProfileStore.getState().error).toBeNull();
  });

  it('handles error in updateUsername', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'Username error' } }),
      }),
    });

    const result = await useProfileStore.getState().updateUsername('u1', 'newusername');
    expect(result).toBe(false);
    expect(useProfileStore.getState().error).toBe('Username error');
  });

  it('updates bio successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });

    const result = await useProfileStore.getState().updateBio('u1', 'New bio');
    expect(result).toBe(true);
    expect(useProfileStore.getState().error).toBeNull();
  });

  it('handles error in updateBio', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'Bio error' } }),
      }),
    });

    const result = await useProfileStore.getState().updateBio('u1', 'New bio');
    expect(result).toBe(false);
    expect(useProfileStore.getState().error).toBe('Bio error');
  });

  it('changes password successfully', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

    const result = await useProfileStore.getState().changePassword('test@example.com', 'newpass');
    expect(result).toBe(true);
    expect(useProfileStore.getState().error).toBeNull();
  });

  it('handles error in changePassword', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: { message: 'Password error' } });

    const result = await useProfileStore.getState().changePassword('test@example.com', 'newpass');
    expect(result).toBe(false);
    expect(useProfileStore.getState().error).toBe('Password error');
  });
});