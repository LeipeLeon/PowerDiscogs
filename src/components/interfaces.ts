interface Artist {
  name: string;
  anv: string;
  join: string;
  role: string;
  tracks: string;
  id: number;
  resource_url: string;
  thumbnail_url: string;
}

interface Tracklist {
  position: string;
  type_: string;
  title: string;
  extraartists?: Artist[];
  duration: string;
}

interface Image {
  type: string;
  uri: string;
  resource_url: string;
  uri150: string;
  width: number;
  height: number;
}

interface MasterItem {
  id: number;
  title: string;
  selected?: boolean;
  thumb?: string;
  main_release?: number;
  most_recent_release?: number;
  resource_url?: string;
  uri?: string;
  versions_url?: string;
  main_release_url?: string;
  most_recent_release_url?: string;
  num_for_sale?: number;
  lowest_price?: number;
  images?: Image[];
  genres?: string[];
  styles?: string[];
  year?: number;
  tracklist?: Tracklist[];
  artists?: Artist[];
  data_quality?: string;
  videos?: [
    {
      uri: string;
      title: string;
      description: string;
      duration: number;
      embed: boolean;
    }
  ];
}

interface Version {
  id: number;
  title: string;
  selected?: boolean;
  label?: string;
  country?: string;
  major_formats?: string[];
  format?: string;
  catno?: string;
  released?: string;
  status?: string;
  resource_url?: string;
  thumb?: string;
  stats?: {
    community: {
      in_wantlist: number;
      in_collection: number;
    };
    user: {
      in_wantlist: number;
      in_collection: number;
    };
  };
}

interface Release {
  id: number;
  title: string;
  selected?: boolean;
  thumb?: string;
  artists_sort?: string;
  num_for_sale?: number;
  lowest_price?: number;
}

export type { MasterItem, Version, Release };
