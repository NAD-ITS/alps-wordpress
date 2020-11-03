@extends('layouts.app')
@section('content')
  @php
    do_action('alps_custom_sidebar_widgets');
  @endphp
  @while(have_posts())
    {!! the_post() !!}
    @php
        global $post;
        extract(\App\TemplateHelpers::getPostData($post->ID));
    @endphp
    @include('patterns.02-organisms.sections.page-header-v2')
    @include('patterns.02-organisms.content.content-single-'.get_post_type())
  @endwhile
@endsection
