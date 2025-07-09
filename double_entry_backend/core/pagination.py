from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # default page size
    page_size_query_param = 'page_size'  # allow frontend to override ?page_size=50
    max_page_size = 100  # cap maximum page size
